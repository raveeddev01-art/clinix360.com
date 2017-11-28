defmodule StitchConnect.Web.GroupChannel do
  use Phoenix.Channel
  use Appsignal.Instrumentation.Decorators

  import Ecto.Query
  alias StitchConnect.MessageLinkPreviewGenerator
  alias StitchConnect.Web.Api.V1.MessageView
  alias StitchConnect.Web.{EventsChannel, PushNotifications}
  alias Stitch.{Repo, Group, GroupUser, GroupAuthorization,
    Message, MessageAuthorization, MessageQueries}
  alias StitchConnect.Web.Presence

  @endpoint StitchConnect.Web.Endpoint

  intercept ["group.new_message", "group.change_message", "msg_link_previews_generated"]

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

  def handle_info(:after_join, socket) do
    push socket, "presence_state", Presence.list(socket)

    {:ok, _} = Presence.track(socket, socket.assigns.current_user.id, %{
      is_typing: false,
    })

    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("typing_started", _params, socket) do
    {:ok, _} = Presence.update(socket, socket.assigns.current_user.id, %{
      is_typing: true,
    })

    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("typing_stopped", _params, socket) do
    {:ok, _} = Presence.update(socket, socket.assigns.current_user.id, %{
      is_typing: false,
    })

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
        |> Map.update("limit", 30, &Enum.min([&1, 50]))
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
        |> Map.update("limit", 30, &Enum.min([&1, 50]))
        |> Enum.map(fn {key, value} -> {String.to_atom(key), value} end)

        messages = MessageQueries.group_recent_messages(group.id, user, opts)
        json = MessageView.render("index.json", %{messages: messages})
        {:reply, {:ok, %{messages: json}}, socket}
    end
  end

  @decorate channel_action()
  def handle_in("feed_surrounding", %{"id" => _} = params, socket) do
    %{group: group, current_user: user} = socket.assigns

    case group do
      {:create_dm, _, _} ->
        {:reply, {:ok, %{messages: []}}, socket}

      group ->
        opts = params
        |> Map.take(["limit", "id"])
        |> Map.update("limit", 30 , &Enum.min([&1, 50]))
        |> Enum.map(fn {key,value} -> {String.to_atom(key), value} end)

        old_messages = MessageQueries.group_latest_messages(group.id, user, Keyword.put(opts, :max_id, opts[:id]))
        more_before = Enum.count(old_messages) > 0

        recent_messages = MessageQueries.group_recent_messages(group.id, user, Keyword.put(opts, :min_id, opts[:id]))
        more_after = Enum.count(recent_messages) > 0

        {:reply, {:ok, %{more_before: more_before, more_after: more_after}}, socket}
    end
  end

  @decorate channel_action()
  def handle_in("group.new_message", params, socket) do
    %{group: group, current_user: user} = socket.assigns
    do_new_message(socket, group, user, params)
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
  def handle_in("group.change_message", %{"message_id" => message_id, "params" => params}, socket) do
    %{group: group, current_user: user} = socket.assigns
    message = Message |> where(id: ^message_id, user_id: ^user.id, group_id: ^group.id) |> Repo.one
    case message && Message.update(message, params) do
      {:ok, message} ->
        MessageLinkPreviewGenerator.queue(message)
        message = MessageQueries.load_info(message)

        broadcast! socket, "group.change_message", message

        json = MessageView.render("show.json", %{message: message})
        {:reply, {:ok, json}, socket}

      nil ->
        {:reply, {:error, %{message: "Message not found."}}, socket}
      {:error, _changeset} ->
        {:reply, {:error, %{message: "Failed to edit message."}}, socket}
    end
  end

  @decorate channel_action()
  def handle_in("group.delete_message", %{"message_id" => message_id}, socket) do
    %{group: group, current_user: user} = socket.assigns
    message = Message |> where(id: ^message_id, user_id: ^user.id, group_id: ^group.id) |> Repo.one
    case message && Message.delete(message) do
      {:ok, %{message: message}} ->
        broadcast! socket, "group.delete_message", %{id: message.id}
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
  def handle_in("group.delete_message_link_preview", %{"message_id" => message_id, "link" => link}, socket) do
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
        broadcast! socket, "msg_link_preview_deleted", %{message_id: message_id, link: link}
        {:reply, :ok, socket}
    end
  end

  def handle_out(event, payload, socket) when event in ["group.new_message", "group.change_message", "msg_link_previews_generated"] do
    json = MessageView.render("show.json", %{message: payload})
    push socket, event, json
    {:noreply, socket}
  end

  defp do_new_message(socket, {:create_dm, id_pair, other_user_id}, user, params) do
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
        assign(socket, :group, group) |> do_new_message(group, user, params)

      {:error, changeset} ->
        case changeset.errors do
          [slug: {"has already been taken", []}] ->
            group = Repo.get_by!(Group, slug: slug)
            assign(socket, :group, group) |> do_new_message(group, user, params)

          _ ->
            {:reply, {:error, %{message: "Failed to create group.", request_id: params["request_id"]}}, socket}
        end
    end
  end

  defp do_new_message(socket, group, user, %{"text_content" => content} = attrs) do
    request_id = attrs["request_id"]

    if GroupAuthorization.is_member?(group.id, user.id) do
      attrs = %{ "text_content" => content, "type" => attrs["type"], "fields" => attrs["fields"] }
      acitve_user_ids = StitchConnect.Web.UserStatusService.active_user_ids(user.team_id)

      case Message.create(group.id, user, attrs, acitve_user_ids) do
        {:ok, %{message: message, notify_user_ids: notify_user_ids}} ->
          MessageLinkPreviewGenerator.queue(message)
          message = MessageQueries.load_info(message)
          broadcast! socket, "group.new_message", Map.put(message, :request_id, request_id)
          EventsChannel.broadcast_group_new_message(group, message, notify_user_ids.desktop)
          PushNotifications.push_new_message_notification(group, message, notify_user_ids.mobile)
          PushNotifications.push_badge_update(message, notify_user_ids.mobile)

          json =
            "show.json"
            |> MessageView.render(%{message: message})
            |> Map.put(:request_id, request_id)
          {:reply, {:ok, json}, socket}

        {:error, _changeset} ->
          {:reply, {:error, %{message: "Failed to create message.", request_id: request_id}}, socket}
      end
    else
      {:reply, {:error, %{message: "Only members can write messages.", request_id: request_id}}, socket}
    end
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
    PushNotifications.push_badge_update_to_user(user)
    {:reply, {:ok, json}, socket}
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
    PushNotifications.push_badge_update_to_user(user)
    {:reply, {:ok, json}, socket}
  end

  def broadcast_star_message(message) do
    group = Repo.get(Group, message.group_id)
    message_json = MessageView.message_json(message)
    @endpoint.broadcast("groups:#{group.slug}", "group.star_message", message_json)
  end

  def broadcast_pin_message(message) do
    group = Repo.get(Group, message.group_id)
    message_json = MessageView.message_json(message)
    @endpoint.broadcast("groups:#{group.slug}", "group.pin_message", message_json)
  end
end
