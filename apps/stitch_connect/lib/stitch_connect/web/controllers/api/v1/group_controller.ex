defmodule StitchConnect.Web.Api.V1.GroupController do
  use StitchConnect.Web, :controller
  alias Stitch.Group

  plug StitchConnect.Plug.ApiAuthenticate when action in [:index]

  def index(conn, _params) do
    groups = Stitch.GroupQueries.available_teams(conn.assigns.current_user.id)
    render conn, "index.json", groups: groups
  end
end