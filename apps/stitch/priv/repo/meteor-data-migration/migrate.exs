Code.load_file("apps/stitch/priv/repo/meteor-data-migration/user.ex")
Code.load_file("apps/stitch/priv/repo/meteor-data-migration/room.ex")

defmodule Stitch.MeteorMigration do
  alias Stitch.Repo
  alias Stitch.{Accounts.User, Team, TeamQueries, Group, GroupUser, Message}
  alias Stitch.MeteorMigration
  import Ecto.Query
  require Logger

  @meteor_data_dir "_meteor-data"

  defmodule MigrationError do
    defexception message: "Meteor migration data couldn't be found."
  end

  def run_migration do
    run_migration(
      "_meteor-data/migrationclinic1/users.json",
      "_meteor-data/migrationclinic1/rooms.json"
    )
  end

  def run_migration(users_json_file, rooms_json_file) do
    team = create_first_team_unless_exists()

    users = MeteorMigration.User.parse_users_json(parse_json_file(users_json_file))
    {_count, users} = MeteorMigration.User.migrate_users(team.id, users)

    indexed_users = index_users(users)
    rooms = MeteorMigration.Room.parse_rooms_json(indexed_users, parse_json_file(rooms_json_file))
    rooms = MeteorMigration.Room.migrate_rooms(team.id, rooms)

    # Remove auto-generate sysmem messages
    group_ids = Group |> where(team_id: ^team.id) |> select([g], g.id) |> Repo.all
    Message |> where([gu], gu.group_id in ^group_ids) |> Repo.delete_all()
  end

  def index_users(users), do: Enum.reduce(users, %{}, & Map.put(&2, &1.username, &1))

  def clean_db do
    team = create_first_team_unless_exists()

    group_ids =
      Group
      |> where(team_id: ^team.id)
      |> select([g], g.id)
      |> Repo.all

    # groups |> Enum.map(& &1.id)

    {group_user_count, _} =
      GroupUser
      |> where([gu], gu.group_id in ^group_ids)
      |> Repo.delete_all()

    {_, _} =
      Message
      |> where([gu], gu.group_id in ^group_ids)
      |> Repo.delete_all()

    {group_count, groups} =
      Group
      |> where(team_id: ^team.id)
      |> Repo.delete_all(returning: true)

    {user_count, _} =
      User
      |> where(team_id: ^team.id)
      |> Repo.delete_all(returning: false)

    IO.puts "Deleted #{user_count} users"
    IO.puts "Deleted #{group_count} groups"
    IO.puts "Deleted #{group_user_count} group_users"
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
        Repo.update!(Ecto.Changeset.change(team, open_invitations_enabled: true, is_legacy: true))
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

  def get_config do
    meteor_data_dir = @meteor_data_dir
    team_name = System.get_env("METEOR_TEAM_NAME")

    unless File.exists?(meteor_data_dir), do: log_meteor_data_error "#{meteor_data_dir} doesn't exist."
    unless team_name, do: log_meteor_data_error "Requires meteor team name. Pass meteor team_name via METEOR_TEAM_NAME env."

    team_directory = Path.join(meteor_data_dir, team_name)
    team_json = Path.join(team_directory, "team.json")
    users_json = Path.join(team_directory, "users.json")
    rooms_json = Path.join(team_directory, "rooms.json")

    unless File.exists?(team_directory), do: log_meteor_data_error "#{team_directory} doesn't exist."
    unless File.exists?(team_json), do: log_meteor_data_error "#{team_json} doesn't exist."
    unless File.exists?(users_json), do: log_meteor_data_error "#{users_json} doesn't exist."
    unless File.exists?(rooms_json), do: log_meteor_data_error "#{rooms_json} doesn't exist."

    %{
      team_json: team_json,
      users_json: users_json,
      rooms_json: rooms_json,
    }
  end

  def log_meteor_data_error(message) do
    Logger.error(message)
    raise MigrationError
  end
end

IO.inspect Stitch.MeteorMigration.get_config
# Stitch.MeteorMigration.clean_db
Stitch.MeteorMigration.run_migration

