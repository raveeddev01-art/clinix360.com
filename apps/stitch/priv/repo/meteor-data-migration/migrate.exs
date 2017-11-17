Code.load_file("apps/stitch/priv/repo/meteor-data-migration/user.ex")
Code.load_file("apps/stitch/priv/repo/meteor-data-migration/room.ex")

defmodule Stitch.MeteorMigration do
  alias Stitch.Repo
  alias Stitch.{Accounts.User, Team, TeamQueries, Group, GroupUser, Message}
  alias Stitch.MeteorMigration
  import Ecto.Query
  require Logger

  @allow_retry false
  @meteor_data_dir "_meteor-data"

  defmodule MigrationError do
    defexception message: "Meteor migration data couldn't be found."
  end

  def run_migration(%{team_json: team_json, users_json: users_json, rooms_json: rooms_json}) do
    Logger.info("Creating team")

    case create_team_unless_exists(parse_json_file(team_json)) do
      {:ok, team} ->
        Logger.info("Migrating users")

        users = MeteorMigration.User.parse_users_json(parse_json_file(users_json))
        {_count, users} = MeteorMigration.User.migrate_users(team.id, users)

        Logger.info("Migrating rooms")

        indexed_users = index_users(users)
        rooms = MeteorMigration.Room.parse_rooms_json(indexed_users, parse_json_file(rooms_json))
        rooms = MeteorMigration.Room.migrate_rooms(team.id, rooms)

        Logger.info("Cleaning auto-generated system messages")

        group_ids = Group |> where(team_id: ^team.id) |> select([g], g.id) |> Repo.all
        Message |> where([gu], gu.group_id in ^group_ids) |> Repo.delete_all()

      {:error, team} ->
        Logger.warn "Skipping migration for #{team.slug}"
    end
  end

  def index_users(users), do: Enum.reduce(users, %{}, & Map.put(&2, &1.username, &1))

  def clean_db(%{team_json: team_json}) do
    raise "Not allowed" unless @allow_retry
    {:ok, team} = create_team_unless_exists(parse_json_file(team_json))

    group_ids =
      Group
      |> where(team_id: ^team.id)
      |> select([g], g.id)
      |> Repo.all

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

    Logger.info "Deleted #{user_count} users"
    Logger.info "Deleted #{group_count} groups"
    Logger.info "Deleted #{group_user_count} group_users"
  end

  def parse_json_file(filepath) when is_binary(filepath) do
    case File.read(filepath) do
      {:error, error} ->
        Logger.error "Error reading file #{filepath}"
        raise error
      {:ok, file} ->
        case Poison.decode(file) do
          {:error, error} ->
            Logger.error "Error parsing json file #{file}"
            raise error
          {:ok, json} -> json
        end
    end
  end

  def create_team_unless_exists(%{"name" => team_name, "slug" => team_slug} = team_json) do
    case TeamQueries.get_by_slug(team_slug) do
      nil ->
        team = Team.Onboarding.create_team(team_name, team_slug)
        Repo.update!(Ecto.Changeset.change(team, open_invitations_enabled: true, is_legacy: true))
        {:ok, team}
      team ->
        Logger.warn "#{team_slug} already exists."
        if @allow_retry do
          {:ok, team}
        else
          {:error, team}
        end
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

  def run do
    config = Stitch.MeteorMigration.get_config
    Logger.info(inspect(config))
    if @allow_retry, do: Stitch.MeteorMigration.clean_db(config)
    Stitch.MeteorMigration.run_migration(config)
  end
end

Stitch.MeteorMigration.run
