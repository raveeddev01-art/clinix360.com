defmodule Stitch.Import.Slack.TeamImport do
  import Ecto.Query
  alias Stitch.{Team, TeamQueries, Group, Repo}

  require Logger

  def find_or_create(team_slug, tier \\ "FREE") do
    case TeamQueries.get_by_slug(team_slug) do
      nil ->
        team = Team.Onboarding.create_team(team_slug, team_slug, tier)

        team = Repo.update!(Ecto.Changeset.change(team, open_invitations_enabled: true))

        {_group_count, _groups} =
          Group
          |> where(team_id: ^team.id)
          |> where(is_default: true)
          |> where([g], is_nil(g.slack_import_id))
          |> Repo.delete_all(returning: true)

        {:ok, team}

      team ->
        Logger.warn("#{team_slug} already exists.")
        {:ok, team}
    end
  end
end
