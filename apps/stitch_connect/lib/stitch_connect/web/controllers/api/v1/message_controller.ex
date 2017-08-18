defmodule StitchConnect.Web.Api.V1.MessageController do
  use StitchConnect.Web, :controller
  alias Stitch.MessageAction
  alias Stitch.MessageQueries
  alias Stitch.Message
  alias Stitch.GroupAuthorization

  plug StitchConnect.Plug.ApiAuthenticate when action in [:index, :create, :toggle_star, :toggle_pin]

  def index(conn, %{"group_id" => group_id}) do
    case GroupAuthorization.can_view?(group_id, conn.assigns.current_user.id) do
      true ->
        messages = MessageQueries.group_latest_messages(group_id, conn.assigns.current_user)
        render conn, "index.json", messages: messages
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't see the messages for this group."})
    end
  end

  def search(conn, %{"term" => term}) do
    messages = MessageQueries.
  end

  def create(conn, %{"group_id" => group_id, "message" => message_params}) do
    case GroupAuthorization.is_member?(group_id, conn.assigns.current_user.id) do
      true ->
        case Message.create(group_id, conn.assigns.current_user.id, message_params) do
          {:ok, message} ->
            message = MessageQueries.load_info(message)
            conn
            |> put_status(:created)
            |> render("show.json", message: message)
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

  def toggle_star(conn, %{"id" => message_id}) do
    message = MessageQueries.get_by_id(message_id)

    case GroupAuthorization.can_view?(message.group_id, conn.assigns.current_user.id) do
      true ->
        case MessageAction.toggle_star(message, conn.assigns.current_user) do
          {:ok, result, _changeset} ->
            message = MessageQueries.load_info(message)
            message = Map.put(message, :starred, result)
            render conn, "show.json", message: message
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

    case GroupAuthorization.is_member?(message.group_id, conn.assigns.current_user.id) do
      true ->
        case MessageAction.toggle_pin(message, conn.assigns.current_user) do
          {:ok, message} ->
            message = MessageQueries.load_info(message)
            render conn, "show.json", message: message
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
