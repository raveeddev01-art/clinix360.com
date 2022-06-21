defmodule StitchConnect.Web.GroupChannel do
  use Stitch.Web, :channel
  import Ecto.Query
  alias Stitch.Accounts.{User, ActivityTracker}
  alias Stitch.LinkPreviewGenerator
  alias StitchConnect.Web.Api.V1.MessageView
  alias Stitch.Web.Api.V1.FileView
  # alias StitchConnect.MessageLinkPreviewGenerator
  alias StitchConnect.Web.PushNotifications
  alias Stitch.Web.EventsChannel

  alias StitchConnect.Web.{
    MessageEventsService
  }

  alias Stitch.{
    Repo,
    Group,
    GroupUser,
    GroupQueries,
    GroupAuthorization,
    Message,
    MessageAuthorization,
    MessageQueries,
    ReadStatus,
    Web.UrlService
  }

  @endpoint Stitch.Web.Endpoint

  def join("groups:__dm:" <> id_pair_string, params, socket) do
    id_pair = id_pair_string |> String.split(".") |> Enum.map(&String.to_integer/1)
    %{team_id: team_id, current_user: user} = socket.assigns
    fetch_messages = get_fetch_messages_param(params)

    with {:sorted, true} <- {:sorted, Enum.sort(id_pair) == id_pair},
         {:member, true} <- {:member, user.id in id_pair},
         {:group, %Group{} = group} <- {:group, GroupQueries.find_dm(id_pair, team_id)},
         {:fetch_messages, false, group} <- {:fetch_messages, fetch_messages, group} do
      {:ok, %{}, assign(socket, :group, group)}
    else
      {:sorted, false} -> {:error, %{message: "User ids should be sorted."}}
      {:member, false} -> {:error, %{message: "You can't participate on this chat."}}
      {:group, nil} -> create_dm_on_join(id_pair, user, socket)
      {:fetch_messages, true, group} -> render_messages(group, user, socket, params)
    end
  end

  def join("groups:id:" <> group_id, params, socket) do
    user = socket.assigns.current_user
    fetch_messages = get_fetch_messages_param(params)

    with {:group, {:ok, group}} <- {:group, GroupQueries.get_by_id(group_id, user)},
         {:authorized?, true} <- {:authorized?, GroupAuthorization.can_view?(group, user)},
         {:fetch_messages, false, group} <- {:fetch_messages, fetch_messages, group} do
      {:ok, %{}, assign(socket, :group, group)}
    else
      {:group, {:error, _}} -> {:error, %{message: "group not found"}}
      {:authorized?, false} -> {:error, %{message: "unauthorized"}}
      {:fetch_messages, true, group} -> render_messages(group, user, socket, params)
    end
  end

  # TODO: Remove this once no one is using older version of mobile app. Also, remove `groups:{group.slug}` broadcasts as well.
  def join("groups:" <> group_slug, params, socket) do
    %{team_id: team_id, current_user: user} = socket.assigns
    fetch_messages = get_fetch_messages_param(params)

    with {:group, %Group{} = group} <-
           {:group, Repo.get_by(Group, slug: group_slug, team_id: team_id)},
         {:authorized?, true} <- {:authorized?, GroupAuthorization.can_view?(group, user)},
         {:fetch_messages, false, group} <- {:fetch_messages, fetch_messages, group} do
      {:ok, %{}, assign(socket, :group, group)}
    else
      {:group, nil} -> {:error, %{message: "group not found"}}
      {:authorized?, false} -> {:error, %{message: "unauthorized"}}
      {:fetch_messages, true, group} -> render_messages(group, user, socket, params)
    end
  end

  defp render_messages(group, user, socket, params) do
    opts = [limit: params["limit"]]
    authenticated_urls = Map.get(params, "authenticated_urls", false)

    messages =
      if params["fetch_messages"] == false do
        []
      else
        MessageQueries.group_latest_messages(group.id, user, opts)
      end

    messages_json =
      MessageView.render("index.json", %{
        messages: messages,
        authenticated_urls: authenticated_urls
      })

    group_user = GroupUser.get(group.id, user.id)

    json =
      if group_user do
        %{
          last_read_at: group_user.last_read_at,
          mentions_count: group_user.mentions_count,
          unread_messages_count: group_user.unread_messages_count,
          messages: messages_json
        }
      else
        %{messages: messages_json}
      end

    {:ok, json, assign(socket, :group, group)}
  end

  # ignore Pigeon callbacks
  def handle_info(_msg, socket) do
    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("is_typing", _params, socket) do
    broadcast_is_typing(socket.assigns.group, socket.assigns.current_user)
    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("feed", %{"max_id" => _} = params, socket) do
    %{group: group, current_user: user} = socket.assigns
    ActivityTracker.async_update_activity(user)
    fetch_users = get_fetch_users_param(params)

    case group do
      {:create_dm, _, _} ->
        {:reply, {:ok, %{messages: []}}, socket}

      group ->
        opts =
          params
          |> Map.take(["limit", "max_id"])
          |> Map.update("limit", 60, &Enum.min([&1, 60]))
          |> Enum.map(fn {key, value} -> {String.to_atom(key), value} end)
          |> Keyword.put(:fetch_users, fetch_users)

        messages = MessageQueries.group_latest_messages(group.id, user, opts)
        json = MessageView.render("index.json", %{messages: messages})
        {:reply, {:ok, %{messages: json}}, socket}
    end
  end

  @decorate channel_action()
  def handle_in("feed_recent", %{"min_id" => _} = params, socket) do
    %{group: group, current_user: user} = socket.assigns
    ActivityTracker.async_update_activity(user)
    fetch_users = get_fetch_users_param(params)

    case group do
      {:create_dm, _, _} ->
        {:reply, {:ok, %{messages: []}}, socket}

      group ->
        opts =
          params
          |> Map.take(["limit", "min_id"])
          |> Map.update("limit", 60, &Enum.min([&1, 60]))
          |> Enum.map(fn {key, value} -> {String.to_atom(key), value} end)
          |> Keyword.put(:fetch_users, fetch_users)

        messages = MessageQueries.group_recent_messages(group.id, user, opts)
        json = MessageView.render("index.json", %{messages: messages})
        {:reply, {:ok, %{messages: json}}, socket}
    end
  end

  @decorate channel_action()
  def handle_in("feed_surrounding", %{"id" => message_id} = params, socket) do
    %{group: group, current_user: user} = socket.assigns
    ActivityTracker.async_update_activity(user)
    limit = Map.get(params, "limit", 60)
    fetch_users = get_fetch_users_param(params)

    case MessageQueries.load_message(message_id, user) do
      nil ->
        {:reply, {:error, %{message: "Message not found."}}, socket}

      target_message ->
        feed_surrounding =
          MessageQueries.surrounding(
            target_message,
            group,
            user,
            limit: limit,
            fetch_users: fetch_users
          )

        json = MessageView.render("feed_surrounding.json", feed_surrounding)
        {:reply, {:ok, json}, socket}
    end
  end

  @decorate channel_action()
  def handle_in("new_msg", params, socket) do
    %{group: group, current_user: user} = socket.assigns
    ActivityTracker.async_update_activity(user)

    message_params_with_client = Message.Params.with_client_attrs("channel", params)
    do_new_msg(socket, group, user, message_params_with_client)
  end

  @decorate channel_action()
  def handle_in("mark_as_unread", %{"message_id" => message_id}, socket) do
    %{group: group, current_user: user} = socket.assigns
    message = Repo.get!(Message, message_id)
    ActivityTracker.async_update_activity(user)

    ReadStatus.mark_as_unread(:message, user.id, group.id, message)
    |> mark_as_unread_response(user, socket)
  end

  @decorate channel_action()
  def handle_in("mark_as_read", _params, socket) do
    %{group: group, current_user: user} = socket.assigns
    ActivityTracker.async_update_activity(user)

    ReadStatus.mark_as_read(:message, user.id, group.id)
    |> mark_as_read_response(user, socket)
  end

  @decorate channel_action()
  def handle_in("edit_msg", %{"message_id" => message_id, "params" => params}, socket) do
    %{group: group, current_user: user} = socket.assigns
    ActivityTracker.async_update_activity(user)

    message =
      Message |> where(id: ^message_id, user_id: ^user.id, group_id: ^group.id) |> Repo.one()

    case message && Message.update(message, params) do
      {:ok, message} ->
        LinkPreviewGenerator.queue(message)
        message = MessageQueries.load_info(message)
        MessageEventsService.message_edit_events(message)
        json = MessageView.render("show.json", %{message: message})
        {:reply, {:ok, json}, socket}

      nil ->
        {:reply, {:error, %{message: "Message not found."}}, socket}

      {:error, _changeset} ->
        {:reply, {:error, %{message: "Failed to edit message."}}, socket}
    end
  end

  @decorate channel_action()
  def handle_in("delete_msg", %{"message_id" => message_id}, socket) when is_number(message_id) do
    %{group: group, current_user: user} = socket.assigns
    ActivityTracker.async_update_activity(user)

    message = Message |> where(id: ^message_id, group_id: ^group.id) |> Repo.one()
    can_delete = message && MessageAuthorization.can_delete?(message, user, group)

    case can_delete && Message.delete(message, user) do
      {:ok, %{message: message}} ->
        broadcast_message_deleted(message)
        EventsChannel.broadcast_group_msg_deleted(group, message)
        PushNotifications.push_badge_update(message)

        {:reply, {:ok, %{id: message.id}}, socket}

      {:error, _changeset} ->
        message_delete_failure_reply(socket)

      _ ->
        {:reply, {:error, %{message: "Message not found."}}, socket}
    end
  end

  def handle_in("delete_msg", _, socket) do
    message_delete_failure_reply(socket)
  end

  @decorate channel_action()
  def handle_in("delete_msg_link_preview", %{"message_id" => message_id, "link" => link}, socket) do
    %{group: group, current_user: user} = socket.assigns
    ActivityTracker.async_update_activity(user)
    message = Message |> where(id: ^message_id, group_id: ^group.id) |> Repo.one()

    case {message, message && MessageAuthorization.can_delete?(message, user, group)} do
      {nil, _} ->
        {:reply, {:error, %{message: "Message not found."}}, socket}

      {_, false} ->
        reason = "Only the message sender or an admin can delete a message's link preview."
        {:reply, {:error, %{message: reason}}, socket}

      {message, true} ->
        %Message{id: message_id} = Message.LinkPreview.delete!(message, link)
        broadcast_msg_link_preview_deleted(group, message_id, link)
        {:reply, :ok, socket}
    end
  end

  @decorate channel_action()
  def handle_in(
        "toggle_reaction",
        %{"message_id" => message_id, "emoji_name" => emoji_name},
        socket
      ) do
    %{group: group, current_user: user} = socket.assigns
    ActivityTracker.async_update_activity(user)
    message = Message |> where(id: ^message_id, group_id: ^group.id) |> Repo.one()

    case {message, message && GroupAuthorization.can_view?(group, user)} do
      {nil, _} ->
        {:reply, {:error, %{message: "Message not found."}}, socket}

      {_, false} ->
        reason = "Access denied"
        {:reply, {:error, %{message: reason}}, socket}

      {message, true} ->
        {:ok, _reaction} = Message.Reaction.toggle_reaction(message, user, emoji_name)
        case message.parent_message_id do
          nil -> broadcast_reactions_updated(group, message)
          _ -> broadcast_comment_reactions_updated(message, user)
        end
        {:reply, :ok, socket}
    end
  end

  def handle_in("ping", %{"id" => id}, socket) do
    {:reply, {:ok, %{id: id}}, socket}
  end

  # TODO: Remove this once mobile apps are using "is typing" w/o presence.
  def handle_in(_supported_event, _params, socket) do
    {:noreply, socket}
  end

  def broadcast_reactions_updated(group, message) do
    message = Repo.get(Message, message.id)
    [message] = Message.Reaction.apply_reactions([message], :message)

    payload = %{
      message_id: message.id,
      group_id: group.id,
      reactions_web: message.reactions
    }

    broadcast_in_event_channel(group, "reactions_updated", payload)
    endpoint_broadcast(group, "reactions_updated", payload)
  end

  def broadcast_message_starred(message, starred_by_user_id) do
    group = Repo.get(Group, message.group_id)

    message_json =
      MessageView.render("starred.json", %{
        message: message,
        user_id: starred_by_user_id,
        group_id: group.id
      })

    broadcast_in_event_channel(group, "starred_message", message_json)
    endpoint_broadcast(group, "starred_message", message_json)
  end

  def broadcast_message_edited(message) do
    group = Repo.get(Group, message.group_id)
    message_json = MessageView.render("show.json", %{message: message})
    broadcast_in_event_channel(group, "edit_msg", message_json)
    endpoint_broadcast(group, "edit_msg", message_json)
  end

  def broadcast_message_updated(message) do
    group = Repo.get(Group, message.group_id)
    message_json = MessageView.render("show.json", %{message: message})
    broadcast_in_event_channel(group, "update_msg", message_json)
    endpoint_broadcast(group, "update_msg", message_json)
  end

  def broadcast_message_deleted(message) do
    group = Repo.get(Group, message.group_id)
    payload = %{id: message.id, group_id: group.id}
    broadcast_in_event_channel(group, "delete_msg", payload)
    endpoint_broadcast(group, "delete_msg", payload)
  end

  def broadcast_message_created(message) do
    group = Repo.get(Group, message.group_id)
    message_json = MessageView.message_json(message, true)
    endpoint_broadcast(group, "new_msg", message_json)
  end

  def broadcast_message_comment_created(message) do
    group = Repo.get(Group, message.group_id)
    message_json = MessageView.message_json(message, true)
    endpoint_broadcast(group, "new_comment", message_json)
  end

  def broadcast_message_pinned(message) do
    group = Repo.get(Group, message.group_id)
    message_json = MessageView.message_json(message)
    broadcast_in_event_channel(group, "pinned_message", message_json)
    endpoint_broadcast(group, "pinned_message", message_json)
  end

  def broadcast_members_update(%User{} = user, removed_groups, added_groups) do
    for group <- removed_groups do
      broadcast_members_update(group, [user], [])
    end

    for group <- added_groups do
      broadcast_members_update(group, [], [user])
    end
  end

  def broadcast_members_update(%Group{} = group, removed_users, added_users) do
    group_user_ids = Stitch.GroupUser.user_ids(group.id)
    update_recipient_ids = Enum.uniq(group_user_ids ++ Enum.map(removed_users, & &1.id))
    EventsChannel.broadcast_members_update(group, update_recipient_ids, group_user_ids)

    for user <- removed_users do
      system_message = Stitch.SystemMessages.generate_user_left_group(group, user)
      broadcast_message_created(system_message)
      EventsChannel.broadcast_group_leave(group, user.id)
    end

    for user <- added_users do
      system_message = Stitch.SystemMessages.generate_user_joined_group(group, user)
      broadcast_message_created(system_message)
      EventsChannel.broadcast_group_join(group, user.id)
    end
  end

  def broadcast_read_status(group, messages) do
    read_status_json = Enum.reduce(messages, %{}, &Map.put(&2, &1.id, &1.read_status))
    payload = %{messages: read_status_json, group_id: group.id}
    broadcast_in_event_channel(group, "read_status_update", payload)
    endpoint_broadcast(group, "read_status_update", payload)
  end

  def broadcast_system_message(group, system_message) do
    system_message = MessageQueries.load_info(system_message)
    message_json = MessageView.render("show.json", %{message: system_message})
    endpoint_broadcast(group, "new_msg", message_json)
  end

  def broadcast_msg_link_previews_generated(group, message) do
    message_json = MessageView.render("show.json", %{message: message})
    broadcast_in_event_channel(group, "msg_link_previews_generated", message_json)
    endpoint_broadcast(group, "msg_link_previews_generated", message_json)
  end

  def broadcast_msg_link_preview_deleted(group, message_id, link) do
    payload = %{message_id: message_id, group_id: group.id, link: link}
    broadcast_in_event_channel(group, "msg_link_preview_deleted", payload)
    endpoint_broadcast(group, "msg_link_preview_deleted", payload)
  end

  def broadcast_is_typing(group, user) do
    endpoint_broadcast(group, "is_typing", %{user_id: user.id, group_id: group.id})
  end

  def broadcast_file_comment_added(upload) do
    file_json = FileView.render("show_with_comments.json", %{file: upload})

    broadcast_in_event_channel(upload.shared_in, "file_comment_added", file_json)

    Enum.each(upload.shared_in, fn group_id ->
      @endpoint.broadcast("groups:id:#{group_id}", "file_comment_added", file_json)
    end)
  end

  def broadcast_file_comment_edited(upload) do
    file_json = FileView.render("show_with_comments.json", %{file: upload})

    broadcast_in_event_channel(upload.shared_in, "file_comment_edited", file_json)

    Enum.each(upload.shared_in, fn group_id ->
      @endpoint.broadcast("groups:id:#{group_id}", "file_comment_edited", file_json)
    end)
  end

  def broadcast_file_comment_deleted(upload) do
    file_json = FileView.render("show_with_comments.json", %{file: upload})

    broadcast_in_event_channel(upload.shared_in, "file_comment_deleted", file_json)

    Enum.each(upload.shared_in, fn group_id ->
      @endpoint.broadcast("groups:id:#{group_id}", "file_comment_deleted", file_json)
    end)
  end

  def broadcast_message_comment_added(message) do
    message_json = MessageView.render("show.json", %{message: message})
    broadcast_in_event_channel(message.group, "message_comment_added", message_json)
    @endpoint.broadcast("groups:id:#{message.group_id}", "message_comment_added", message_json)
  end

  def broadcast_message_comment_edited(message) do
    message_json = MessageView.render("show.json", %{message: message})
    broadcast_in_event_channel(message.group, "message_comment_edited", message_json)
    @endpoint.broadcast("groups:id:#{message.group_id}", "message_comment_edited", message_json)
  end

  def broadcast_comment_reactions_updated(message, user) do
    message = MessageQueries.load_message(message.parent_message_id, user)
    message_json = MessageView.render("show.json", %{message: message})
    broadcast_in_event_channel(message.group, "comment_reactions_updated", message_json)
    @endpoint.broadcast("groups:id:#{message.group_id}", "comment_reactions_updated", message_json)
  end

  def broadcast_message_comment_deleted(message) do
    message_json = MessageView.render("show.json", %{message: message})
    broadcast_in_event_channel(message.group, "message_comment_deleted", message_json)
    @endpoint.broadcast("groups:id:#{message.group_id}", "message_comment_deleted", message_json)
  end

  def broadcast_in_event_channel(%Group{} = group, event_name, payload) do
    for group_user <- GroupUser.group_users_for(group.id) do
      @endpoint.broadcast("events:#{group_user.user_id}", event_name, payload)
    end
  end

  def broadcast_in_event_channel(group_ids, event_name, payload) when is_list(group_ids) do
    for group_user <- GroupUser.group_users_for(group_ids) do
      @endpoint.broadcast("events:#{group_user.user_id}", event_name, payload)
    end
  end

  def broadcast_file_public_link_updated(upload) do
    url =
      if upload.public_token,
        do: UrlService.public_download_page(upload, upload.public_token),
        else: nil

    json = %{
      upload_id: upload.id,
      public_url: url
    }

    broadcast_in_event_channel(upload.shared_in, "file_public_link_updated", json)

    Enum.each(upload.shared_in, fn group_id ->
      @endpoint.broadcast("groups:id:#{group_id}", "file_public_link_updated", json)
    end)
  end

  def broadcast_file_details_update(upload) do
    file_json = FileView.render("show_with_comments.json", %{file: upload})

    broadcast_in_event_channel(upload.shared_in, "file_details_updated", file_json)

    Enum.each(upload.shared_in, fn group_id ->
      @endpoint.broadcast("groups:id:#{group_id}", "file_details_updated", file_json)
    end)
  end

  def broadcast_file_deleted(upload) do
    broadcast_in_event_channel(upload.shared_in, "file_deleted", %{upload_id: upload.id})

    Enum.each(upload.shared_in, fn group_id ->
      @endpoint.broadcast("groups:id:#{group_id}", "file_deleted", %{upload_id: upload.id})
    end)
  end

  defp endpoint_broadcast(group, event, payload) do
    # TODO: Remove this once no one is using older version of mobile app.
    @endpoint.broadcast("groups:#{group.slug}", event, payload)
    @endpoint.broadcast("groups:id:#{group.id}", event, payload)
  end

  defp create_dm_on_join(id_pair, user, socket) do
    with {:dm, true} <- {:dm, length(id_pair) == 2},
         [other_user_id] <- List.delete(id_pair, user.id) do
      socket = assign(socket, :group, {:create_dm, other_user_id})
      {:ok, %{messages: []}, socket}
    else
      _error -> {:error, %{message: "group not found"}}
    end
  end

  defp do_new_msg(socket, {:create_dm, other_user_id}, user, params) do
    with {:ok, group} <- Group.create_single_dm(user, [user.id, other_user_id]) do
      socket
      |> assign(:group, group)
      |> do_new_msg(group, user, params)
    else
      {:error, %{errors: [slug: {"has already been taken", []}]} = changeset} ->
        {:ok, group} = GroupQueries.find_by_slug(changeset.changes.slug, user)

        socket
        |> assign(:group, group)
        |> do_new_msg(group, user, params)

      _error ->
        {:reply,
         {:error, %{message: "Failed to create group.", request_id: params["request_id"]}},
         socket}
    end
  end

  defp do_new_msg(socket, group, user, attrs) do
    request_id = attrs["request_id"]

    if GroupAuthorization.can_message?(group, user.id) do
      presence_user_ids = StitchConnect.Web.UserStatusService.presence_user_ids(user.team_id)

      case Message.create(group, user, attrs, presence_user_ids) do
        {:ok, %{message: message, notify_user_ids: notify_user_ids}} ->
          LinkPreviewGenerator.queue(message)
          message = MessageQueries.load_info(message)
          message = Repo.preload(message, :upload, force: true)

          StitchConnect.Web.Api.V1.MessageController.create_optional_upload_comment(
            message,
            group,
            user,
            presence_user_ids,
            attrs
          )

          Stitch.Mobile.NotificationLogger.start(message, notify_user_ids.mobile)
          Stitch.Task.start(fn ->
            Stitch.EmailNotification.create(message.id, notify_user_ids.email)
            broadcast_message_created(message)
            EventsChannel.broadcast_group_new_msg(group, message, notify_user_ids.desktop)
            PushNotifications.notify_users(group, message, notify_user_ids.mobile)
            PushNotifications.push_badge_update(message, notify_user_ids.mobile)
          end)

          json = MessageView.render("show.json", %{message: message})
          {:reply, {:ok, json}, socket}

        {:error, :message, changeset, _changeset_so_far} ->
          error_message = Stitch.Web.ControllerHelpers.changeset_errors_to_string(changeset)

          {:reply, {:error, %{message: error_message, request_id: request_id}}, socket}
      end
    else
      {:reply, {:error, %{message: "Only members can write messages.", request_id: request_id}},
       socket}
    end
  end

  defp message_delete_failure_reply(socket) do
    {:reply, {:error, %{message: "Failed to delete message"}}, socket}
  end

  defp mark_as_read_response({:error, reason}, _user, socket) do
    {:reply, {:error, %{message: reason}}, socket}
  end

  defp mark_as_read_response(
         {:ok, %{mark_messages_as_read: {_, messages}, mark_group_as_read: {1, [group_user]}}},
         user,
         socket
       ) do
    json = %{
      group_id: group_user.group_id,
      last_read_at: group_user.last_read_at,
      mentions_count: group_user.mentions_count,
      unread_messages_count: group_user.unread_messages_count
    }

    EventsChannel.broadcast_marked_as_read(user, json)

    messages = MessageQueries.load_info(messages)
    messages_json = MessageView.render("index.json", %{messages: messages})
    broadcast_read_status(socket.assigns.group, messages_json)

    PushNotifications.push_badge_update_to_user(user)
    {:reply, {:ok, json}, socket}
  end

  defp mark_as_unread_response({:error, error_message}, _user, socket) do
    {:reply, {:error, %{message: error_message}}, socket}
  end

  defp mark_as_unread_response(
         {:ok,
          %{mark_messages_as_unread: {_, messages}, mark_group_as_unread: {1, [group_user]}}},
         user,
         socket
       ) do
    messages = MessageQueries.load_info(messages)
    messages_json = MessageView.render("index.json", %{messages: messages})

    json = %{
      messages: messages_json,
      group_id: group_user.group_id,
      last_read_at: group_user.last_read_at,
      mentions_count: group_user.mentions_count,
      unread_messages_count: group_user.unread_messages_count
    }

    EventsChannel.broadcast_marked_as_unread(user, json)
    broadcast_read_status(socket.assigns.group, messages_json)
    PushNotifications.push_badge_update_to_user(user)
    {:reply, {:ok, json}, socket}
  end

  # TODO: remove once web and mobile apps don't rely on messages in channel feed.
  defp get_fetch_messages_param(%{"fetchMessages" => "false"}), do: false
  defp get_fetch_messages_param(_params), do: true

  # Note: remove once all clients are updated and don't rely on embedded users.
  defp get_fetch_users_param(%{"fetchUsers" => "false"}), do: false
  defp get_fetch_users_param(_params), do: true
end
