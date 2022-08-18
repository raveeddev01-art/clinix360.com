defmodule Stitch.Repo.Scripts.ExportAllTeams do
  # mix run apps/stitch/priv/repo/export_all_teams.exs

  alias Stitch.{AWS.S3}

  require Logger

  def run do
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
  end
end

Stitch.Repo.Scripts.ExportAllTeams.run()
