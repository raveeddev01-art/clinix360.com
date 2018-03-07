defmodule StitchConnect.Web.Api.V1.MessageController do
  use StitchConnect.Web, :controller
  alias StitchConnect.MessageLinkPreviewGenerator
  alias StitchConnect.Web.{
    EventsChannel,
    GroupChannel,
    PushNotifications,
    UserStatusService,
    Api.V1.MessageView,
  }

  alias Stitch.{
    GroupAuthorization,
    GroupQueries,
    Group,
    Message,
    MessageAction,
    MessageQueries,
    Message.Upload
  }

  action_fallback(StitchConnect.Web.Api.V1.FallbackController)

  plug :parse_query_params when action in [:index, :feed_recent, :search, :feed_surrounding]

  def index(conn, %{"group_id" => group_id}) do
    current_user = conn.assigns.current_user
    with {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:authorized?, true} <- {:authorized?, GroupAuthorization.can_view?(group, current_user)} do
      messages = MessageQueries.group_latest_messages(group_id, current_user, conn.assigns.query_opts)
      render(conn, "index.json", messages: messages, user_id: current_user.id)
    else
      {:group, _} -> {:error, :not_found, "The room you are looking for does not exist."}
      {:authorized?, false} -> {:error, :not_authorized, "You can't see the messages for this room."}
    end
  end

  def feed_recent(conn, %{"group_id" => group_id}) do
    current_user = conn.assigns.current_user
    with {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:authorized?, true} <- {:authorized?, GroupAuthorization.can_view?(group, current_user)} do
      messages = MessageQueries.group_recent_messages(group_id, current_user, conn.assigns.query_opts)
      render(conn, "index.json", messages: messages, user_id: current_user.id)
    else
      {:group, _} -> {:error, :not_found, "The room you are looking for does not exist."}
      {:authorized?, false} -> {:error, :not_authorized, "You can't see the messages for this room."}
    end
  end

  def search(conn, %{"term" => term}) do
    current_user = conn.assigns.current_user
    messages = MessageQueries.search(current_user.id, term, conn.assigns.query_opts)
    render(conn, "index.json", messages: messages, user_id: current_user.id)
  end

  def feed_surrounding(conn, %{"group_id" => group_id, "message_id" => message_id}) do
    current_user = conn.assigns.current_user
    with {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:authorized?, true} <- {:authorized?, GroupAuthorization.can_view?(group, current_user)},
         {:message, %Message{} = message} <- {:message, MessageQueries.get_by_id(message_id, false)} do
      feed_surrounding = MessageQueries.surrounding(message, group, current_user, conn.assigns.query_opts)
      render(conn, "feed_surrounding.json", feed_surrounding)
    else
      {:group, _} -> {:error, :not_found, "The room you are looking for does not exist."}
      {:authorized?, false} -> {:error, :not_authorized, "You can't see the messages for this room."}
      {:message, _} -> {:error, :not_found}
    end
  end

  def create(conn, %{"group_id" => group_id, "message" => message_params}) do
    current_user = conn.assigns.current_user
    with {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:authorized?, true} <- {:authorized?, GroupAuthorization.is_member?(group_id, current_user.id)},
         presence_user_ids = UserStatusService.presence_user_ids(current_user.team_id),
         {:ok, %{message: message, notify_user_ids: notify_user_ids}} <-
           Message.create(group.id, current_user, message_params, presence_user_ids) do
      message = %{message | user: current_user}
      message_events(message, group, notify_user_ids)
      conn
      |> put_status(:created)
      |> render("show.json", message: message)
    else
      {:group, _} -> {:error, :not_found, "The room you are looking for does not exist."}
      {:authorized?, false} -> {:error, :not_authorized, "You can't see the messages for this room."}
      {:error, :message, changeset, _changeset_so_far} ->
        {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}
    end
  end

  defp message_events(message, group, notify_user_ids) do
    Stitch.Task.start(fn ->
      MessageLinkPreviewGenerator.queue(message)
      GroupChannel.broadcast_message_created(message)
      EventsChannel.broadcast_group_new_msg(group, message, notify_user_ids.desktop)
      PushNotifications.notify_users(group, message, notify_user_ids.mobile)
      PushNotifications.push_badge_update(message, notify_user_ids.mobile)
    end)
  end

  def mark_as_read(conn, %{"group_id" => group_id}) do
    current_user = conn.assigns.current_user
    with {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:ok, response} <- Message.mark_as_read(current_user.id, group.id) do
      %{mark_messages_as_read: {_, messages}, mark_group_as_read: {1, [group_user]}} = response
      messages_json = MessageView.render("index.json", %{messages: messages})
      mark_as_read_json = MessageView.render("mark_as_read.json", %{
        messages_json: messages_json,
        group_user: group_user
      })
      mark_as_read_events(group, current_user, messages_json, mark_as_read_json)
      json(conn, %{status: "ok"})
    else
      {:group, nil} -> {:error, :not_found}
      {:error, message} -> {:error, :not_authorized, message}
    end
  end

  def mark_as_read_events(group, current_user, messages_json, json) do
    Stitch.Task.start(fn ->
      EventsChannel.broadcast_marked_as_read(current_user, json)
      GroupChannel.broadcast_read_status(group, messages_json)
      PushNotifications.push_badge_update_to_user(current_user)
    end)
  end

  def mark_as_unread(conn, %{"group_id" => group_id, "message_id" => message_id}) do
    current_user = conn.assigns.current_user
    with {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:message, %Message{} = message} <- {:message, MessageQueries.get_by_id(message_id, false)},
         {:ok, response} <- Message.mark_as_unread(current_user.id, group.id, message) do
      %{mark_messages_as_unread: {_, messages}, mark_group_as_unread: {1, [group_user]}} = response
      messages_json = MessageView.render("index.json", %{messages: messages})
      mark_as_read_json = MessageView.render("mark_as_read.json", %{
        messages_json: messages_json,
        group_user: group_user
      })
      mark_as_unread_events(group, current_user, messages_json, mark_as_read_json)
      json(conn, %{status: "ok"})
    else
      {:group, nil} -> {:error, :not_found}
      {:error, message} -> {:error, :not_authorized, message}
    end
  end

  def mark_as_unread_events(group, current_user, messages_json, json) do
    Stitch.Task.start(fn ->
      EventsChannel.broadcast_marked_as_unread(current_user, json)
      GroupChannel.broadcast_read_status(group, messages_json)
      PushNotifications.push_badge_update_to_user(current_user)
    end)
  end

  def download(conn, %{"id" => message_id}) do
    message = MessageQueries.get_by_id(message_id)
    user = conn.assigns.current_user

    with {:authorized?, true} <- {:authorized?, GroupAuthorization.can_view?(message.group, user)},
         {:ok, presigned_url} <- Upload.presign(message) do
      json(conn, %{presigned_url: presigned_url})
    else
      {:authorized?, false} -> {:error, :not_found}
      :error -> {:error, :not_found}
    end
  end

  def update(conn, %{"id" => message_id, "message" => message_params}) do
    message = MessageQueries.get_by_id(message_id)
    user = conn.assigns.current_user

    case user.id == message.user_id do
      true ->
        case Message.update(message, message_params) do
          {:ok, message} ->
            MessageLinkPreviewGenerator.queue(message)
            message = MessageQueries.load_info(message)
            GroupChannel.broadcast_message_edited(message)
            render(conn, "show.json", message: message, user_id: user.id)

          {:error, :message, changeset, _changeset_so_far} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{message: changeset_errors_to_string(changeset)})
        end

      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't edit other users' messages"})
    end
  end

  def delete(conn, %{"id" => message_id}) do
    message = MessageQueries.get_by_id(message_id)

    case conn.assigns.current_user.id == message.user_id do
      true ->
        case Message.delete(message) do
          {:ok, _message} ->
            GroupChannel.broadcast_message_deleted(message)
            EventsChannel.broadcast_group_msg_deleted(message.group, message)
            PushNotifications.push_badge_update(message)
            send_resp(conn, :no_content, "")

          {:error, _failed_operation, _failed_value, _changeset} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{message: "Failed to delete message"})
        end

      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't delete other users' messages"})
    end
  end

  def toggle_star(conn, %{"id" => message_id}) do
    message = MessageQueries.get_by_id(message_id)
    group = GroupQueries.get_by_id(message.group_id)
    user = conn.assigns.current_user

    case GroupAuthorization.can_view?(group, user) do
      true ->
        case MessageAction.toggle_star(message, user) do
          {:ok, result, _changeset} ->
            message = MessageQueries.load_info(message)
            message = Map.put(message, :starred, result)
            GroupChannel.broadcast_message_starred(message)
            render(conn, "show.json", message: message, user_id: user.id)

          {:error, changeset} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{message: changeset_errors_to_string(changeset)})
        end

      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't star messages belonging to this room."})
    end
  end

  def toggle_pin(conn, %{"id" => message_id}) do
    message = MessageQueries.get_by_id(message_id)
    user = conn.assigns.current_user

    case GroupAuthorization.is_member?(message.group_id, user.id) do
      true ->
        case MessageAction.toggle_pin(message, user) do
          {:ok, message} ->
            message = MessageQueries.load_info(message)
            GroupChannel.broadcast_message_pinned(message)
            render(conn, "show.json", message: message, user_id: user.id)

          {:error, changeset} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{message: changeset_errors_to_string(changeset)})
        end

      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't pin messages belonging to this room."})
    end
  end

  def parse_query_params(conn, _opts) do
    types = %{skip: :integer, limit: :integer, min_id: :integer, max_id: :integer}
    changeset = Ecto.Changeset.cast({%{}, types}, conn.params, Map.keys(types))
    query_opts = Enum.into(changeset.changes, [])
    query_opts = Keyword.put(query_opts, :fetch_users, get_fetch_users_param(conn.params))
    assign(conn, :query_opts, query_opts)
  end
end