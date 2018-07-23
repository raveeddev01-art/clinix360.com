defmodule Stitch.Repo.Scripts.AddDefaultInbox do
  @moduledoc """
  Creates default inbox for each existing team.

  iex> Code.load_file("/Users/work/code/stitch-phoenix/apps/stitch/priv/repo/add_default_inbox.exs")
  iex> Stitch.Repo.Scripts.AddDefaultInbox.run()

  # Alternatively, run from shell (will execute the `run` command)
  sh> mix run /Users/work/code/stitch-phoenix/apps/stitch/priv/repo/add_default_inbox.exs
  """

  use Ecto.Migration

  import Ecto.Query
  import Ecto.Changeset
  require Logger

  alias Stitch.{
    Files.Upload,
    Files.UploadComment,
    Files.FileQueries,
    Repo,
    Group,
    Message,
    GroupQueries,
    UserQueries,
    Accounts.User,
    TeamQueries,
    Engage.Inbox,
    Team
  }

  def run do
    team_ids = TeamQueries.team_ids()

    team_ids
    |> Enum.chunk_every(2)
    |> Enum.each(fn team_ids ->
      team_ids
      |> Elixir.Task.async_stream(
        fn team_id ->
          team = Stitch.Repo.get(Team, team_id)
          handle_team(team)
        end,
        timeout: :infinity
      )
      |> Stream.run()
    end)
  end

  def handle_team(team) do
    exists =
      Inbox
      |> where(team_id: ^team.id)
      |> where(is_default: true)
      |> where(name: "General")
      |> Repo.one()

    unless exists do
      Stitch.Engage.Inbox.create_for_team(team.id)
    end
  end
end
