Code.load_file("apps/stitch/priv/repo/meteor-data-migration/user.ex")
Code.load_file("apps/stitch/priv/repo/meteor-data-migration/room.ex")
Code.load_file("apps/stitch/priv/repo/meteor-data-migration/message.ex")

defmodule Stitch.MeteorMigration do
  alias Stitch.Repo
  alias Stitch.{Accounts.User, Team, TeamQueries, Group, GroupUser, Message}
  alias Stitch.MeteorMigration
  import Ecto.Query
  require Logger
  alias ExAws.S3

  @team_name System.get_env("METEOR_TEAM_NAME")
  @meteor_data_dir "/tmp"
  @s3 Application.get_env(:stitch, :aws_user_upload)

  @allow_retry System.get_env("METEOR_ALLOW_RETRY") == "true"
  @use_local_data System.get_env("METEOR_USE_LOCAL_DATA") == "true"
  @migrate_messages System.get_env("METEOR_MIGRATE_MESSAGES") == "true"

  defmodule MigrationError do
    defexception message: "Meteor migration data couldn't be found."
  end

  def download(filename, dest) do
    if @use_local_data do
      file_path = Path.join(["_meteor-data", filename])
      Logger.debug("Copying #{file_path} to #{dest}")
      {File.cp(file_path, dest), :done}
    else
      S3.download_file(@s3.bucket, filename, dest) |> ExAws.request
    end
  end

  def run_migration(%{team_json: team_json, users_json: users_json, rooms_json: rooms_json, messages_json: messages_json}) do
    Logger.info("Creating team")

    case create_team_unless_exists(parse_json_file(team_json)) do
      {:ok, team} ->
        Logger.info("Migrating users")

        meteor_users = MeteorMigration.User.parse_users_json(parse_meteor_json(users_json))
        {_count, users} = MeteorMigration.User.migrate_users(team.id, meteor_users)

        identify_on_intercom(users)

        Logger.info("Migrating rooms")

        indexed_users = index_users(users)
        rooms = MeteorMigration.Room.parse_rooms_json(indexed_users, parse_meteor_json(rooms_json))
        rooms = MeteorMigration.Room.migrate_rooms(team.id, rooms)

        Logger.info("Restoring guest membership")
        indexed_meteor_users = index_users(meteor_users)
        indexed_meteor_rooms = index_rooms(rooms)
        MeteorMigration.User.restoring_guest_membership(indexed_meteor_users, indexed_users, indexed_meteor_rooms)
        Logger.info("Restoring default room membership")
        MeteorMigration.User.enforce_default_group_membership(team.id, users)

        Logger.info("Cleaning auto-generated system messages")

        group_ids = Group |> where(team_id: ^team.id) |> select([g], g.id) |> Repo.all
        Message |> where([gu], gu.group_id in ^group_ids) |> Repo.delete_all()

        if @migrate_messages do
          Logger.info("Migrating messages")
          indexed_rooms = index_rooms(rooms)
          messages = MeteorMigration.Message.run(indexed_rooms, indexed_users, messages_json)

          # messages = MeteorMigration.Message.parse_messages_json(indexed_rooms, indexed_users, parse_meteor_json(messages_json))
          # messages = MeteorMigration.Message.migrate_messages(messages)
        end

        # indexed_rooms = index_rooms(rooms)
        # messages = MeteorMigration.Message.parse_messages_json(indexed_rooms, indexed_users, parse_meteor_json(messages_json))
        # messages = MeteorMigration.Message.migrate_messages(messages)

        Logger.info("Finished migrating team")

      {:error, team} ->
        Logger.warn "Skipping migration for #{team.slug}"
    end
  end

  def identify_on_intercom(users) do
    for user <- users do
      Stitch.Analytics.identify_and_group(user)
    end
  end

  def index_users(users), do: Enum.reduce(users, %{}, & Map.put(&2, &1.username, &1))

  def index_rooms(rooms) do
    rooms |> Enum.reduce(%{}, fn ({group, meteor_id}, acc) ->
      Map.put(acc, meteor_id, group)
    end)
  end

  def clean_db(%{team_json: team_json}) do
    unless @allow_retry, do: raise "Not allowed"
    {:ok, %{is_legacy: true} = team} = create_team_unless_exists(parse_json_file(team_json))

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

    {group_count, _groups} =
      Group
      |> where(team_id: ^team.id)
      |> Repo.delete_all(returning: true)

    {user_count, _} =
      User
      |> where(team_id: ^team.id)
      |> Repo.delete_all(returning: false)

    Repo.delete!(team)

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

  def create_team_unless_exists(%{"name" => team_name, "slug" => team_slug} = _team_json) do
    case TeamQueries.get_by_slug(team_slug) do
      nil ->
        team = Team.Onboarding.create_team(team_name, team_slug)
        team = Repo.update!(Ecto.Changeset.change(team, open_invitations_enabled: true, is_legacy: true))

        {_group_count, _groups} =
          Group
          |> where(team_id: ^team.id)
          |> where(is_default: true)
          |> Repo.delete_all(returning: true)

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

  def get_config do
    Logger.info("Downloading migration files from S3")

    File.rm_rf("/tmp/#{@team_name}")
    File.mkdir_p("/tmp/#{@team_name}")

    {:ok, :done} = download("#{@team_name}-team.json", "/tmp/#{@team_name}/team.json")
    {:ok, :done} = download("#{@team_name}-users.json", "/tmp/#{@team_name}/users.json")
    {:ok, :done} = download("#{@team_name}-rooms.json", "/tmp/#{@team_name}/rooms.json")
    {:ok, :done} = download("#{@team_name}-messages.json", "/tmp/#{@team_name}/messages.json")

    unless File.exists?(@meteor_data_dir), do: log_meteor_data_error "#{@meteor_data_dir} doesn't exist."
    unless @team_name, do: log_meteor_data_error "Requires meteor team name. Pass meteor team_name via METEOR_TEAM_NAME env."

    team_directory = Path.join(@meteor_data_dir, @team_name)
    team_json = Path.join(team_directory, "team.json")
    users_json = Path.join(team_directory, "users.json")
    rooms_json = Path.join(team_directory, "rooms.json")
    messages_json = Path.join(team_directory, "messages.json")

    unless File.exists?(team_directory), do: log_meteor_data_error "#{team_directory} doesn't exist."
    unless File.exists?(team_json), do: log_meteor_data_error "#{team_json} doesn't exist."
    unless File.exists?(users_json), do: log_meteor_data_error "#{users_json} doesn't exist."
    unless File.exists?(rooms_json), do: log_meteor_data_error "#{rooms_json} doesn't exist."
    unless File.exists?(messages_json), do: log_meteor_data_error "#{messages_json} doesn't exist."

    %{
      team_json: team_json,
      users_json: users_json,
      rooms_json: rooms_json,
      messages_json: messages_json,
    }
  end

  def log_meteor_data_error(message) do
    Logger.error(message)
    raise MigrationError
  end

  def parse_meteor_json(file) do
    room = File.read!(file)
    room = "[" <> room <> "]"
    room = room |> String.split("\n") |> Enum.map_join(& String.trim(&1)) |> String.replace("}{", "},{")
    room = room |> String.split("\n") |> Enum.map_join(fn line ->
      line = String.replace(line, ~r/NumberInt\(([^)]+)\)/, "\\1")
      line = String.replace(line, ~r/ISODate\(([^)]+)\)/, "\\1")
      line
    end)
    Poison.decode!(room)
  end

  def run do
    config = Stitch.MeteorMigration.get_config
    Logger.info(inspect(config))
    if @allow_retry, do: Stitch.MeteorMigration.clean_db(config)
    Stitch.MeteorMigration.run_migration(config)
  end
end

Stitch.MeteorMigration.run