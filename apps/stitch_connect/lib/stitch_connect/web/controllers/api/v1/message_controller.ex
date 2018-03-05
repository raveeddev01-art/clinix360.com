defmodule StitchConnect.Web.Api.V1.MessageController do
  use StitchConnect.Web, :controller
  alias StitchConnect.MessageLinkPreviewGenerator
  alias StitchConnect.Web.{EventsChannel, GroupChannel, PushNotifications}

  alias Stitch.{
    GroupAuthorization,
    GroupQueries,
    Message,
    MessageAction,
    MessageQueries,
    Message.Upload
  }

  action_fallback(StitchConnect.Web.Api.FallbackController)

  def index(conn, %{"group_id" => group_id} = params) do
    user = conn.assigns.current_user
    fetch_users = get_fetch_users_param(params)

    with {:group, {:ok, group}} <- {:group, GroupQueries.get_by_id(group_id, user)},
         {:authorized?, true} <- {:authorized?, GroupAuthorization.can_view?(group, user)} do
      opts =
        params
        |> Map.take(["limit", "skip"])
        |> Enum.map(fn {key, value} ->
          value =
            case value do
              value when is_binary(value) -> String.to_integer(value)
              value when is_integer(value) -> value
            end

          {:"#{key}", value}
        end)
        |> Keyword.update(:limit, 60, fn limit -> Enum.min([limit, 60]) end)
        |> Keyword.put(:fetch_users, fetch_users)

      messages = MessageQueries.group_latest_messages(group_id, user, opts)
      render(conn, "index.json", messages: messages, user_id: user.id)
    else
      {:group, _} ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "The room you are looking for does not exist."})

      {:authorized?, false} ->
        conn
        |> put_status(:forbidden)
        |> json(%{message: "You can't see the messages for this room."})
    end
  end

  def search(conn, %{"term" => term} = params) do
    opts = [
      limit: Enum.min([Map.get(params, "limit", 60), 1_000]),
      skip: Map.get(params, "skip", 0)
    ]

    user = conn.assigns.current_user
    messages = MessageQueries.search(conn.assigns.current_user.id, term, opts)
    render(conn, "index.json", messages: messages, user_id: user.id)
  end

  def create(conn, %{"group_id" => group_id, "message" => message_params}) do
    user = conn.assigns.current_user

    with {:group, {:ok, group}} <- {:group, GroupQueries.get_by_id(group_id, user)},
         {:authorized?, true} <- {:authorized?, GroupAuthorization.is_member?(group_id, user.id)},
         presence_user_ids = StitchConnect.Web.UserStatusService.presence_user_ids(user.team_id),
         {:ok, %{message: message, notify_user_ids: notify_user_ids}} <-
           Message.create(group.id, user, message_params, presence_user_ids) do
      MessageLinkPreviewGenerator.queue(message)
      message = message |> MessageQueries.load_info()
      GroupChannel.broadcast_message_created(message)
      EventsChannel.broadcast_group_new_msg(group, message, notify_user_ids.desktop)
      PushNotifications.notify_users(group, message, notify_user_ids.mobile)
      PushNotifications.push_badge_update(message, notify_user_ids.mobile)

      conn
      |> put_status(:created)
      |> render("show.json", message: message, user_id: user.id)
    else
      {:group, _} ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "The room you are looking for does not exist."})

      {:authorized?, false} ->
        conn
        |> put_status(:forbidden)
        |> json(%{message: "You can't see the messages for this room."})

      {:error, :message, changeset, _changeset_so_far} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})
    end
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

  # Note: remove once all clients are updated and don't rely on embedded users.
  defp get_fetch_users_param(%{"fetchUsers" => "false"}), do: false
  defp get_fetch_users_param(_params), do: true
end