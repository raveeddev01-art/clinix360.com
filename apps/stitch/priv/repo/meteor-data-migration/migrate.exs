Code.load_file("apps/stitch/priv/repo/meteor-data-migration/user.ex")

defmodule Stitch.MeteorMigration do
  alias Stitch.Repo
  alias Stitch.{Accounts.User, Team, TeamQueries}
  alias Stitch.MeteorMigration
  import Ecto.Query

  def run_migration(users_json_file \\ "_meteor-data/users.json") do
    team = create_first_team_unless_exists()
    users = MeteorMigration.User.parse_users_json(parse_json_file(users_json_file))
    MeteorMigration.User.migrate_users(team.id, users)
  end

  def clean_db do
    team = create_first_team_unless_exists()
    {count, _} =
      User
      |> where(team_id: ^team.id)
      |> Repo.delete_all(returning: false)
    IO.puts "Deleted #{count}"
  end

  def parse_json_file(filepath) when is_binary(filepath) do
    case File.read(filepath) do
      {:error, error} ->
        IO.puts "Error reading file #{filepath}"
        raise error
      {:ok, file} ->
        case Poison.decode(file) do
          {:error, error} ->
            IO.puts "Erro parsing json file #{file}"
            raise error
          {:ok, json} -> json
        end
    end
  end

  def create_first_team_unless_exists do
    team_name = "Migration Clinic 1"
    team_slug = "migrationclinic1"

    case TeamQueries.get_by_slug(team_slug) do
      nil ->
        team = Team.Onboarding.create_team(team_name, team_slug)
        Repo.update!(Ecto.Changeset.change(team, open_invitations_enabled: true))
        team
      team ->
        IO.puts "#{team_slug} already exists."
        team
    end
  end

  def parse_team_json(_team) do
    # TODO:
  end

  @doc """
  Expected format

    [%{name: "team name", slug: "team_slug"}, ...]

  """
  def migrate_teams(teams) do
    teams |> Enum.each(fn team ->
      team_name = team["name"]
      team_slug = team["slug"]
      team = Team.Onboarding.create_team(team_name, team_slug)
      Repo.update!(Ecto.Changeset.change(team, open_invitations_enabled: true))
    end)
  end
end

Stitch.MeteorMigration.run_migration
# Stitch.MeteorMigration.clean_db
