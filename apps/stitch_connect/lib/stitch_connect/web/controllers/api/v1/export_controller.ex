defmodule StitchConnect.Web.Api.V1.ExportController do
  use StitchConnect.Web, :controller
  alias Stitch.Exports
  alias StitchConnect.Web.ErrorView

  def index(conn, _params) do
    team = conn.assigns.team
    exports = Exports.list_exports(team)
    render(conn, "index.json", exports: exports)
  end

  def create(conn, _params) do
    team = conn.assigns.team
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

  def download(conn, %{"id" => id}) do
    team = conn.assigns.team
    if export = Exports.get_export([id: id, team_id: team.id]) do
      presigned_url = Exports.presigned_url(export.zip_url)
      redirect(conn, external: presigned_url)
    else
      conn
      |> put_status(:not_found)
      |> render(ErrorView, :"404")
    end
  end

end
