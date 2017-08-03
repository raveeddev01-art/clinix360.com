defmodule StitchConnect.Web.Api.V1.GroupController do
  use StitchConnect.Web, :controller
  alias Stitch.Group

  plug StitchConnect.Plug.ApiAuthenticate when action in [:index, :search]

  def index(conn, _params) do
    groups = Stitch.GroupQueries.available_groups(conn.assigns.current_user.id)
    render conn, "index.json", groups: groups
  end

  def search(conn, %{"term" => term}) do
    result_groups = Stitch.GroupQueries.search(conn.assigns.current_user.id, term)
  end
end