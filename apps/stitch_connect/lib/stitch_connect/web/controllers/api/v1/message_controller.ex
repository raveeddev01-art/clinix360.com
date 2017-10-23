defmodule StitchConnect.Web.Api.V1.MessageController do
  use StitchConnect.Web, :controller
  alias Stitch.{Repo, Group, GroupAuthorization, GroupQueries,
                Message, MessageAction, MessageQueries}
  alias StitchConnect.Web.{Endpoint, EventsChannel}

  def index(conn, %{"group_id" => group_id} = params) do
    user = conn.assigns.current_user
    group = GroupQueries.get_by_id(group_id)

    case GroupAuthorization.can_view?(group, user) do
      true ->
        opts =
          params
          |> Map.take(["limit", "skip"])
          |> Enum.map(fn {key, value} ->
            value = case value do
              value when is_binary(value) -> String.to_integer(value)
              value when is_integer(value) -> value
            end

            {:"#{key}", value}
          end)
          |> Keyword.update(:limit, 30, fn limit -> Enum.min([limit, 30]) end)

        messages = MessageQueries.group_latest_messages(group_id, user, opts)
        render conn, "index.json", messages: messages, user_id: user.id
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't see the messages for this room."})
    end
  end

  def search(conn, %{"term" => term} = params) do
    opts = [
      limit: Enum.min([Map.get(params, "limit", 30), 1_000]),
      skip: Map.get(params, "skip", 0),
    ]

    user = conn.assigns.current_user
    messages = MessageQueries.search(conn.assigns.current_user.id, term, opts)
    render conn, "index.json", messages: messages, user_id: user.id
  end

  def create(conn, %{"group_id" => group_id, "message" => message_params}) do
    group = Repo.get! Group, group_id
    user = conn.assigns.current_user
    case GroupAuthorization.is_member?(group_id, user.id) do
      true ->
        active_user_ids = StitchConnect.Web.UserStatusService.active_user_ids(user.team_id)
        case Message.create(group.id, user, message_params, active_user_ids) do
          {:ok, %{message: message, notify_user_ids: notify_user_ids}} ->
            message = message |> MessageQueries.load_info
            Endpoint.broadcast("groups:#{group.slug}", "new_msg", message)
            EventsChannel.broadcast_group_new_msg(group, message, notify_user_ids)

            conn
            |> put_status(:created)
            |> render("show.json", message: message, user_id: user.id)
          {:error, :message, changeset, _changeset_so_far} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{message: changeset_errors_to_string(changeset)})
        end
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't see the messages for this room."})
    end
  end

  def download(conn, %{"id" => message_id}) do
    message = MessageQueries.get_by_id(message_id)

    case GroupAuthorization.can_view?(message.group, conn.assigns.current_user) do
      true ->
        case StitchConnect.Upload.presign(message) do
          {:ok, presigned_url} ->
            redirect conn, external: presigned_url
          :error ->
            conn
            |> put_status(:unauthorized)
            |> json(%{message: "Not found"})
        end

      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not found"})
    end
  end

  def update(conn, %{"id" => message_id, "message" => message_params}) do
    message = MessageQueries.get_by_id(message_id)
    user = conn.assigns.current_user

    case user.id == message.user_id do
      true ->
        case Message.update(message, message_params) do
          {:ok, message} ->
            message = MessageQueries.load_info(message)
            Endpoint.broadcast("groups:#{message.group.slug}", "edit_msg", message)
            render conn, "show.json", message: message, user_id: user.id
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
            Endpoint.broadcast("groups:#{message.group.slug}", "delete_msg", %{id: message.id})
            EventsChannel.broadcast_group_msg_deleted(message.group, message)
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
            EventsChannel.broadcast_msg_starred(message, user)
            render conn, "show.json", message: message, user_id: user.id
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
            render conn, "show.json", message: message, user_id: user.id
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
end
