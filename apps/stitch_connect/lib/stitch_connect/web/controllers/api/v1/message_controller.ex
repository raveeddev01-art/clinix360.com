defmodule StitchConnect.Web.Api.V1.MessageController do
  use StitchConnect.Web, :controller
  alias Stitch.{Message, Group}
  alias Stitch.GroupAuthorization
  alias Stitch.MessageQueries

  plug StitchConnect.Plug.ApiAuthenticate when action in [:index]

  def index(conn, %{"group_id" => group_id}) do
    case GroupAuthorization.can_view?(group_id, conn.assigns.current_user.id) do
      true ->
        messages = MessageQueries.group_latest_messages(group_id)
        render conn, "index.json", messages: messages
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't see the messages for this group."})
    end
  end
end
