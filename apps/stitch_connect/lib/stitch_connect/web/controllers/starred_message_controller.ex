defmodule StitchConnect.Web.Api.V1.StarredMessageController do
  use StitchConnect.Web, :controller
  alias Stitch.MessageQueries

  plug StitchConnect.Plug.ApiAuthenticate when action in [:index]

  def index(conn, _) do
    starred_messages = MessageQueries.user_starred_messages(conn.assigns.current_user.id)
    render conn, "index.json", starred_messages: starred_messages
  end
end
