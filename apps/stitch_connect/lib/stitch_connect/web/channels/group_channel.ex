defmodule StitchConnect.Web.GroupChannel do
  use StitchConnect.Web, :channel
  use Appsignal.Instrumentation.Decorators
  import Ecto.Query
  alias Stitch.Accounts.{User}
  alias StitchConnect.Web.Api.V1.MessageView
  alias StitchConnect.MessageLinkPreviewGenerator
  alias StitchConnect.Web.{EventsChannel, PushNotifications}
  alias Stitch.{Repo, Group, GroupUser, GroupAuthorization,
    Message, MessageAuthorization, MessageQueries}

  @endpoint StitchConnect.Web.Endpoint
  @max_latency 5_000

  def join("groups:__dm:" <> id_pair, _params, socket) do
    ids_pair = id_pair |> String.split(".") |> Enum.map(&String.to_integer/1)

    # make sure clients sort ids, to make sure they connect to same channel
    if Enum.sort(ids_pair) == ids_pair do
      %{team_id: team_id, current_user: user} = socket.assigns

      if user.id in ids_pair do
        case Repo.get_by(Group, slug: "__dm:#{id_pair}", team_id: team_id) do
          nil ->
            if length(ids_pair) == 2 do # if single user dm, create group on first message
              [other_user_id] = List.delete(ids_pair, user.id)
              send self(), :after_join
              {:ok, %{messages: []}, assign(socket, :group, {:create_dm, id_pair, other_user_id})}
            else
              {:error, %{message: "group not found"}}
            end

          group ->
            messages = MessageQueries.group_latest_messages(group.id, user)
            json = MessageView.render("index.json", %{messages: messages})
            send self(), :after_join
            {:ok, %{messages: json}, assign(socket, :group, group)}
        end
      else
        {:error, %{message: "You can't participate on this chat."}}
      end
    else
      {:error, %{message: "User ids should be sorted."}}
    end
  end

  def join("groups:id:" <> group_id, _params, socket) do
    %{team_id: team_id, current_user: user} = socket.assigns

    case Repo.get_by(Group, id: String.to_integer(group_id), team_id: team_id) do
      nil ->
        {:error, %{message: "group not found"}}
      group ->
        case GroupAuthorization.can_view?(group, user) do
          true ->
            messages = MessageQueries.group_latest_messages(group.id, user)
            json = MessageView.render("index.json", %{messages: messages})
            {:ok, %{messages: json}, assign(socket, :group, group)}
          false ->
            {:error, %{message: "unauthorized"}}
        end
    end
  end

  # TODO: Remove this once no one is using older version of mobile app. Also, remove `groups:{group.slug}` broadcasts as well.
  def join("groups:" <> group_slug, _params, socket) do
    %{team_id: team_id, current_user: user} = socket.assigns

    case Repo.get_by(Group, slug: group_slug, team_id: team_id) do
      nil ->
        {:error, %{message: "group not found"}}
      group ->
        case GroupAuthorization.can_view?(group, user) do
          true ->
            messages = MessageQueries.group_latest_messages(group.id, user)
            json = MessageView.render("index.json", %{messages: messages})
            send self(), :after_join
            {:ok, %{messages: json}, assign(socket, :group, group)}
          false ->
            {:error, %{message: "unauthorized"}}
        end
    end
  end

  # ignore Pigeon callbacks
  def handle_info(_msg, socket) do
    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("sync_time", %{"timestamp" => timestamp}, socket) do
    socket =
      socket
      |> assign(:server_join_time, :os.system_time(:milli_seconds))
      |> assign(:client_join_time, timestamp)

    {:reply, {:ok, %{message: "ok"}}, socket}
  end

  @decorate channel_action()
  def handle_in("is_typing", _params, socket) do
    broadcast_is_typing(socket.assigns.group, socket.assigns.current_user)
    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("feed", %{"max_id" => _} = params, socket) do
    %{group: group, current_user: user} = socket.assigns

    case group do
      {:create_dm, _, _} ->
        {:reply, {:ok, %{messages: []}}, socket}

      group ->
        opts = params
        |> Map.take(["limit", "max_id"])
        |> Map.update("limit", 60, &Enum.min([&1, 60]))
        |> Enum.map(fn {key, value} -> {String.to_atom(key), value} end)

        messages = MessageQueries.group_latest_messages(group.id, user, opts)
        json = MessageView.render("index.json", %{messages: messages})
        {:reply, {:ok, %{messages: json}}, socket}
    end
  end

  @decorate channel_action()
  def handle_in("feed_recent", %{"min_id" => _} = params, socket) do
    %{group: group, current_user: user} = socket.assigns

    case group do
      {:create_dm, _, _} ->
        {:reply, {:ok, %{messages: []}}, socket}

      group ->
        opts = params
        |> Map.take(["limit", "min_id"])
        |> Map.update("limit", 60, &Enum.min([&1, 60]))
        |> Enum.map(fn {key, value} -> {String.to_atom(key), value} end)

        messages = MessageQueries.group_recent_messages(group.id, user, opts)
        json = MessageView.render("index.json", %{messages: messages})
        {:reply, {:ok, %{messages: json}}, socket}
    end
  end

  @decorate channel_action()
  def handle_in("feed_surrounding", %{"id" => message_id} = params, socket) do
    %{group: group, current_user: user} = socket.assigns
    limit = Map.get(params, "limit", 60)

    case MessageQueries.get_by_id(message_id) do
      nil ->
        {:reply, {:error, %{message: "Message not found."}}, socket}
      target_message ->
        {messages_before, messages_after} = MessageQueries.surrounding(target_message, group, user, limit)
        messages = messages_before ++ [target_message] ++ messages_after
        messages_json = MessageView.render("index.json", %{messages: messages})

        {:reply, {:ok, %{
          more_before: length(messages_before) >= limit,
          more_after: length(messages_after) >= limit,
          messages: messages_json,
        }}, socket}
    end
  end

  @decorate channel_action()
  def handle_in("new_msg", params, socket) do
    if latency_limit_exceeded?(socket, params) do
      {:reply, {:error, %{message: "timeout error"}}, socket}
    else
      %{group: group, current_user: user} = socket.assigns
      do_new_msg(socket, group, user, params)
    end
  end

  @decorate channel_action()
  def handle_in("mark_as_unread", %{"message_id" => message_id}, socket) do
    %{group: group, current_user: user} = socket.assigns
    message = Repo.get!(Message, message_id)

    Message.mark_as_unread(user.id, group.id, message)
    |> mark_as_unread_response(user, socket)
  end

  @decorate channel_action()
  def handle_in("mark_as_read", _params, socket) do
    %{group: group, current_user: user} = socket.assigns

    Message.mark_as_read(user.id, group.id)
    |> mark_as_read_response(user, socket)
  end

  @decorate channel_action()
  def handle_in("edit_msg", %{"message_id" => message_id, "params" => params}, socket) do
    %{group: group, current_user: user} = socket.assigns
    message = Message |> where(id: ^message_id, user_id: ^user.id, group_id: ^group.id) |> Repo.one
    case message && Message.update(message, params) do
      {:ok, message} ->
        MessageLinkPreviewGenerator.queue(message)
        message = MessageQueries.load_info(message)
        broadcast_message_edited(message)
        json = MessageView.render("show.json", %{message: message})
        {:reply, {:ok, json}, socket}

      nil ->
        {:reply, {:error, %{message: "Message not found."}}, socket}
      {:error, _changeset} ->
        {:reply, {:error, %{message: "Failed to edit message."}}, socket}
    end
  end

  @decorate channel_action()
  def handle_in("delete_msg", %{"message_id" => message_id}, socket) do
    %{group: group, current_user: user} = socket.assigns
    message = Message |> where(id: ^message_id, user_id: ^user.id, group_id: ^group.id) |> Repo.one
    case message && Message.delete(message) do
      {:ok, %{message: message}} ->
        broadcast_message_deleted(message)
        EventsChannel.broadcast_group_msg_deleted(group, message)
        PushNotifications.push_badge_update(message)

        {:reply, {:ok, %{id: message.id}}, socket}

      nil ->
        {:reply, {:error, %{message: "Message not found."}}, socket}
      {:error, _changeset} ->
        {:reply, {:error, %{message: "Failed to delete message."}}, socket}
    end
  end

  @decorate channel_action()
  def handle_in("delete_msg_link_preview", %{"message_id" => message_id, "link" => link}, socket) do
    %{group: group, current_user: user} = socket.assigns
    message = Message |> where(id: ^message_id, group_id: ^group.id) |> Repo.one

    case {message, message && MessageAuthorization.can_delete?(message, user)} do
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
  def handle_in("toggle_reaction", %{"message_id" => message_id, "emoji_name" => emoji_name}, socket) do
    %{group: group, current_user: user} = socket.assigns
    message = Message |> where(id: ^message_id, group_id: ^group.id) |> Repo.one

    case {message, message && GroupAuthorization.can_view?(group, user)} do
      {nil, _} ->
        {:reply, {:error, %{message: "Message not found."}}, socket}

      {_, false} ->
        reason = "Access denied"
        {:reply, {:error, %{message: reason}}, socket}

      {message, true} ->
        {:ok, _reaction} = Message.Reaction.toggle_reaction(message, user, emoji_name)
        broadcast_reactions_updated(group, message)
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
    [message] = Message.Reaction.apply_reactions([message])
    endpoint_broadcast(group, "reactions_updated", %{message_id: message.id, reactions_web: message.reactions})
  end

  def broadcast_message_starred(message) do
    group = Repo.get(Group, message.group_id)
    message_json = MessageView.message_json(message)
    endpoint_broadcast(group, "starred_message", message_json)
  end

  def broadcast_message_edited(message) do
    group = Repo.get(Group, message.group_id)
    message_json = MessageView.render("show.json", %{message: message})
    endpoint_broadcast(group, "edit_msg", message_json)
  end

  def broadcast_message_deleted(message) do
    group = Repo.get(Group, message.group_id)
    endpoint_broadcast(group, "delete_msg", %{id: message.id})
  end

  def broadcast_message_created(message) do
    group = Repo.get(Group, message.group_id)
    message_json = MessageView.render("show.json", %{message: message})
    endpoint_broadcast(group, "new_msg", message_json)
  end

  def broadcast_message_pinned(message) do
    group = Repo.get(Group, message.group_id)
    message_json = MessageView.message_json(message)
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
    read_status_json = Enum.reduce(messages, %{}, & Map.put(&2, &1.id, &1.read_status))
    endpoint_broadcast(group, "read_status_update", %{messages: read_status_json})
  end

  def broadcast_system_message(group, system_message) do
    system_message = MessageQueries.load_info(system_message)
    message_json = MessageView.render("show.json", %{message: system_message})
    endpoint_broadcast(group, "new_msg", message_json)
  end

  def broadcast_msg_link_previews_generated(group, message) do
    message_json = MessageView.render("show.json", %{message: message})
    endpoint_broadcast(group, "msg_link_previews_generated", message_json)
  end

  def broadcast_msg_link_preview_deleted(group, message_id, link) do
    endpoint_broadcast(group, "msg_link_preview_deleted", %{message_id: message_id, link: link})
  end

  def broadcast_is_typing(group, user) do
    endpoint_broadcast(group, "is_typing", %{user_id: user.id})
  end

  defp endpoint_broadcast(group, event, payload) do
    # TODO: Remove this once no one is using older version of mobile app.
    @endpoint.broadcast("groups:#{group.slug}", event, payload)
    @endpoint.broadcast("groups:id:#{group.id}", event, payload)
  end

  defp do_new_msg(socket, {:create_dm, id_pair, other_user_id}, user, params) do
    slug = "__dm:#{id_pair}"
    attrs = %{team_id: socket.assigns.team_id, name: "__dm_group__", slug: slug, public: false}
    result = %Group{} |> Group.changeset(attrs) |> Repo.insert

    case result do
      {:ok, group} ->
        for id <- Enum.uniq([user.id, other_user_id]) do
          %GroupUser{}
          |> GroupUser.changeset(%{group_id: group.id, user_id: id})
          |> Repo.insert!
        end
        assign(socket, :group, group) |> do_new_msg(group, user, params)

      {:error, changeset} ->
        case changeset.errors do
          [slug: {"has already been taken", []}] ->
            group = Repo.get_by!(Group, slug: slug)
            assign(socket, :group, group) |> do_new_msg(group, user, params)

          _ ->
            {:reply, {:error, %{message: "Failed to create group.", request_id: params["request_id"]}}, socket}
        end
    end
  end

  defp do_new_msg(socket, group, user, attrs) do
    request_id = attrs["request_id"]

    if GroupAuthorization.is_member?(group.id, user.id) do
      presence_user_ids = StitchConnect.Web.UserStatusService.presence_user_ids(user.team_id)

      case Message.create(group.id, user, attrs, presence_user_ids) do
        {:ok, %{message: message, notify_user_ids: notify_user_ids}} ->
          MessageLinkPreviewGenerator.queue(message)
          message = MessageQueries.load_info(message)

          Stitch.Task.start fn ->
            broadcast_message_created(message)
            EventsChannel.broadcast_group_new_msg(group, message, notify_user_ids.desktop)
            PushNotifications.push_new_msg_notification(group, message, notify_user_ids.mobile)
            PushNotifications.push_badge_update(message, notify_user_ids.mobile)
          end

          json = MessageView.render("show.json", %{message: message})
          {:reply, {:ok, json}, socket}

        {:error, :message, changeset, _changeset_so_far} ->
          error_message = StitchConnect.Web.ControllerHelpers.changeset_errors_to_string(changeset)
          {:reply, {:error, %{message: error_message, request_id: request_id}}, socket}
      end
    else
      {:reply, {:error, %{message: "Only members can write messages.", request_id: request_id}}, socket}
    end
  end

  defp mark_as_read_response({:error, reason}, _user, socket) do
    {:reply, {:error, %{message: reason}}, socket}
  end

  defp mark_as_read_response({:ok, %{mark_messages_as_read: {_, messages}, mark_group_as_read: {1, [group_user]}}}, user, socket) do
    messages = MessageQueries.load_info(messages)
    messages_json = MessageView.render("index.json", %{messages: messages})
    json = %{
      messages: messages_json,
      group_id: group_user.group_id,
      last_read_at: group_user.last_read_at,
      mentions_count: group_user.mentions_count,
      unread_messages_count: group_user.unread_messages_count,
    }
    EventsChannel.broadcast_marked_as_read(user, json)
    broadcast_read_status(socket.assigns.group, messages_json)
    PushNotifications.push_badge_update_to_user(user)
    {:reply, {:ok, json}, socket}
  end

  defp mark_as_unread_response({:error, error_message}, _user, socket) do
    {:reply, {:error, %{message: error_message}}, socket}
  end

  defp mark_as_unread_response({:ok, %{mark_messages_as_unread: {_, messages}, mark_group_as_unread: {1, [group_user]}}}, user, socket) do
    messages = MessageQueries.load_info(messages)
    messages_json = MessageView.render("index.json", %{messages: messages})
    json = %{
      messages: messages_json,
      group_id: group_user.group_id,
      last_read_at: group_user.last_read_at,
      mentions_count: group_user.mentions_count,
      unread_messages_count: group_user.unread_messages_count,
    }
    EventsChannel.broadcast_marked_as_unread(user, json)
    broadcast_read_status(socket.assigns.group, messages_json)
    PushNotifications.push_badge_update_to_user(user)
    {:reply, {:ok, json}, socket}
  end

  # Temporarily return false if timestamps aren't provided so that the mobile apps have time to catch up with the change
  defp latency_limit_exceeded?(socket, params) do
    server_join_time = socket.assigns[:server_join_time]
    with client_join_time when not is_nil(client_join_time) <- socket.assigns[:client_join_time],
          client_push_time when not is_nil(client_push_time) <- params["timestamp"] do
      server_time = :os.system_time(:milli_seconds)
      latency = client_push_time - (client_join_time + (server_time - server_join_time))
      abs(latency) > @max_latency
    else _e ->
      false
    end
  end
end
