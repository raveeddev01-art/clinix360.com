defmodule StitchConnect.Web.Admin.TeamController do
  use StitchConnect.Web, :controller
  alias Stitch.Paginator
  alias Stitch.TeamQueries

  def index(conn, %{"page" => page, "limit" => limit}) do
    limit = ensure_integer(limit) || 10
    page = ensure_integer(page) || 1
    skip = (page - 1) * limit
    query = TeamQueries.admin_teams_query()
    %{data: teams, meta: meta} = Paginator.new(query, skip: skip, limit: limit)
    render(conn, "index.html", teams: teams, meta: meta)
  end
  def index(conn, _params) do
    query = TeamQueries.admin_teams_query()
    %{data: teams, meta: meta} = Paginator.new(query, [])
    render(conn, "index.html", teams: teams, meta: meta)
  end
end
