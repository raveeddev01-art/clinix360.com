defmodule StitchConnect.Web.Api.V1.MessageController do
  use StitchConnect.Web, :controller
  alias Stitch.{Repo, Group, GroupAuthorization,
                Message, MessageAction, MessageQueries}
  alias StitchConnect.Web.{Endpoint, EventsChannel}

  plug StitchConnect.Plug.ApiAuthenticate

  def index(conn, %{"group_id" => group_id}) do
    user = conn.assigns.current_user
    case GroupAuthorization.can_view?(group_id, user.id) do
      true ->
        messages = MessageQueries.group_latest_messages(group_id, user)
        render conn, "index.json", messages: messages, user_id: user.id
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't see the messages for this group."})
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
        case Message.create(group.id, user, message_params) do
          {:ok, message} ->
            message = MessageQueries.load_info(message)

            Endpoint.broadcast("groups:#{group.slug}", "new_msg", message)
            EventsChannel.broadcast_group_new_msg(group, message)
            EventsChannel.broadcast_mention_counter_update(group, message.mentioned_user_ids)

            conn
            |> put_status(:created)
            |> render("show.json", message: message, user_id: user.id)
          {:error, changeset} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{message: changeset_errors_to_string(changeset)})
        end

      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't see the messages for this group."})
    end
  end

  def update(conn, %{"id" => message_id, "message" => message_params}) do
    message = MessageQueries.get_by_id(message_id)
    user = conn.assigns.current_user

    case user.id == message.user_id do
      true ->
        case Message.update(message, message_params) do
          {:ok, %{message: message, mentioned_user_ids: mentioned_user_ids}} ->
            message = MessageQueries.load_info(message)

            Endpoint.broadcast("groups:#{message.group.slug}", "edit_msg", message)
            EventsChannel.broadcast_mention_counter_update(message.group, mentioned_user_ids)

            render conn, "show.json", message: message, user_id: user.id
          {:error, changeset} ->
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
            EventsChannel.broadcast_mention_counter_update(message.group, message.mentioned_user_ids)

            send_resp(conn, :no_content, "")
          {:error, changeset} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{message: changeset_errors_to_string(changeset)})
        end
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't delete other users' messages"})
    end
  end

  def toggle_star(conn, %{"id" => message_id}) do
    message = MessageQueries.get_by_id(message_id)
    user = conn.assigns.current_user

    case GroupAuthorization.can_view?(message.group_id, user.id) do
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
        |> json(%{message: "You can't star messages belonging to this group."})
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
        |> json(%{message: "You can't pin messages belonging to this group."})
    end
  end
end
