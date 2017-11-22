defmodule StitchConnect.Web.ExportController do
  use StitchConnect.Web, :controller
  alias Stitch.Exports
  alias Stitch.Exports.Export

  action_fallback StitchConnect.Web.Api.FallbackController

  def download(conn, %{"id" => id}) do
    team = conn.assigns.team
    current_user = conn.assigns.current_user

    with {:ok, export} <- authorize_download(id, team, current_user) do
      presigned_url = Exports.presigned_url(export.zip_url)
      redirect(conn, external: presigned_url)
    end
  end

  defp authorize_download(id, team, current_user) do
    admin? = Enum.member?(current_user.roles, "admin")
    export = Exports.get_export([id: id, team_id: team.id])

    case {admin?, export} do
      {true, %Export{} = export} -> {:ok, export}
      _ -> {:error, :not_found}
    end
  end
end
