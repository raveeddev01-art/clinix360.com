defmodule Stitch.Analytics.TeamSnapshot do
  @moduledoc """
  Takes snapshot of team info as part of daily reports.
  """
  # import Ecto.Query

  use Appsignal.Instrumentation.Decorators

  require Logger
  alias(Stitch.{Analytics.SnapshotQueries, ChunkStream, Team})

  @doc """
  Creates a daily report for each team, persists event to db, cleans up data used only for snapshot.
  """
  @spec create :: any
  @decorate transaction(:background_job)
  def create do
    Logger.info("Running Team snapshot")

    Team
    |> ChunkStream.chunk(50)
    |> Stream.each(&take_snapshots/1)
    |> Stream.run()
  end

  def take_snapshots(teams) do
    Enum.map(teams, &take_snapshot/1)
  end

  def take_snapshot(team) do
    case make_snapshot_item(team) do
      {:ok, snapshot} -> clean_snapshot_data(snapshot)
      _ -> :error
    end
  end

  def make_snapshot_item("team"), do: "remove me"

  def make_snapshot_item(team) do
    params = %{
      team_id: team.id,
      daily_active_users: SnapshotQueries.active_users(:day, team),
      weekly_active_users: SnapshotQueries.active_users(:week, team),
      monthly_active_users: SnapshotQueries.active_users(:month, team),
      daily_messages_sent: SnapshotQueries.daily_messages_sent(team),
      daily_files_uploaded: SnapshotQueries.daily_files_uploaded(team),
      daily_reads: SnapshotQueries.daily_reads(team),
      daily_sessions: SnapshotQueries.daily_sessions(team)
    }

    Logger.info("here are some params:")
    IO.inspect(params)

    {:ok, :snapshot}
  end

  def clean_snapshot_data(_team) do
    {:ok, :clean}
  end
end

# TODOs:
# get each field I care about into a Map
# save the snapshot to the db
# clean up old data data
