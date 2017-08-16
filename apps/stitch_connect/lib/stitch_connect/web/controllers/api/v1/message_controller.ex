defmodule StitchConnect.Web.Api.V1.MessageController do
  use StitchConnect.Web, :controller
  alias Stitch.{MessageAction}
  alias Stitch.GroupAuthorization
  alias Stitch.MessageQueries

  plug StitchConnect.Plug.ApiAuthenticate when action in [:index, :toggle_star, :toggle_pin]

  def index(conn, %{"group_id" => group_id}) do
    case GroupAuthorization.can_view?(group_id, conn.assigns.current_user.id) do
      true ->
        messages = MessageQueries.group_latest_messages(group_id)
        messages = MessageAction.apply_user_message_actions(conn.assigns.current_user, messages)
        render conn, "index.json", messages: messages
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
          {:error, reason} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{message: reason})
        end
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't star messages belonging to this group."})
    end
  end

  def toggle_pin(conn, %{"id" => message_id}) do
    message = MessageQueries.get_by_id(message_id)

    case GroupAuthorization.can_view?(message.group_id, conn.assigns.current_user.id) do
      true ->
        case MessageAction.toggle_pin(message, conn.assigns.current_user) do
          {:ok, message} ->
            message = MessageQueries.load_info(message)
            render conn, "show.json", message: message
          {:error, reason} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{message: reason})
        end
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't pin messages belonging to this group."})
    end
  end
end
