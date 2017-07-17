defmodule StitchConnect.Web.Api.V1.RoomController do
  use StitchConnect.Web, :controller
  plug StitchConnect.Plug.ApiAuthenticate when action in [:index]

  def index(conn, params) do
    rooms = Stitch.RoomQueries.rooms_for_team(conn.assigns.current_user.team_id)
    render conn, "index.json", rooms: rooms
  end
end
