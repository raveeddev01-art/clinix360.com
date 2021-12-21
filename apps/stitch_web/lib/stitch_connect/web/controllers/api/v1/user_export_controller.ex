defmodule StitchConnect.Web.Api.V1.UserExportController do
  use Stitch.Web, :controller
  alias Stitch.{Exports, Accounts.User}
  alias Stitch.{AWS.S3}
  require Logger

  def index(conn, _params) do
    team = conn.assigns.team
    exports = Exports.list_user_exports(team)
    render(conn, "index.json", exports: exports)
  end

  def create(conn, %{"user_id" => user_id}) do
    team = conn.assigns.team
    current_user = conn.assigns.current_user
    Exports.clean_outdated_user_exports(team, current_user)

    with {:user, %User{} = target_user} <- {:user, Stitch.UserQueries.get_by_id(user_id)},
         {:authorized, true} <-
           {:authorized, Exports.authorized_to_create_user_export?(current_user, target_user)},
         {:export, {:ok, user_export}} = {:export, Exports.create_user_export(team, target_user)} do
      Exports.schedule_export(team, user_export)
      user_export = %{user_export | user: target_user}
      render(conn, "show.json", export: user_export)
    else
      error ->
        conn
        |> put_status(:too_many_requests)
        |> render("429.json")
    end
  end

  def full_backup(conn, %{"exportToken" => "zMKA1AMn9XhxuQKmXGQI"}) do
    Logger.info("[ExportAllTeams] Started for all teams")

    Stitch.Task.start(fn ->
      Stitch.Team
      |> Stitch.Repo.all()
      |> Enum.each(fn team ->
        Logger.info("[ExportAllTeams] Started: #{team.id} #{team.slug}")

        with {:ok, zip_path} <- Stitch.Exports.TeamHistory.generate_zip(team, :timer.hours(5)),
             {:ok, _} <- S3.upload(zip_path),
             :ok <- File.rm(zip_path) do
          zip_url = S3.fullpath(zip_path)
          Logger.info("[ExportAllTeams] Finished: #{team.id} #{team.slug} #{zip_url}")
        else
          error ->
            Logger.info("[ExportAllTeams] Error: #{team.id} #{team.slug} #{inspect(error)}")
        end
      end)

      Logger.info("[ExportAllTeams] Finished for all teams")
    end)

    conn
    |> json(%{message: "Background export process started"})
  end

  def full_backup(conn, _params) do
    conn
    |> put_status(:not_found)
    |> json(%{message: "Not found"})
  end
end
