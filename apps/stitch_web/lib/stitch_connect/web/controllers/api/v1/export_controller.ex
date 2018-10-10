defmodule StitchConnect.Web.Api.V1.ExportController do
  use Stitch.Web, :controller
  alias Stitch.{Exports, Accounts.User}

  def index(conn, _params) do
    team = conn.assigns.team
    exports = Exports.list_exports(team)
    render(conn, "index.json", exports: exports)
  end

  def create(conn, _params) do
    team = conn.assigns.team
    Exports.clean_outdated(team)

    if Exports.authorized_to_create_export?(team) do
      {:ok, export} = Exports.create_export(team)
      Exports.schedule_export(team, export)
      render(conn, "show.json", export: export)
    else
      conn
      |> put_status(:too_many_requests)
      |> render("429.json")
    end
  end
end
