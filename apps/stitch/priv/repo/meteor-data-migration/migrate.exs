defmodule Stitch.Migrate do
  alias Stitch.Repo
  alias Stitch.{Accounts, Accounts.User}
  alias Stitch.{Team, TeamQueries, Group, GroupUser, Message}

  defmodule ParserError do
    defexception message: "Invalid JSON format"
  end

  def run_migration(users_json_file \\ "_meteor-data/users.json") do
    # Parse json file (stop if there are errors -- it means we won't be able to insert all records into the database)

    team = create_first_team_unless_exists()
    users = parse_users_json(parse_json_file(users_json_file))
    migrate_users(team.id, users)
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

  @doc """
  Minimum expected set of attributes:

    {
      "_id" : "4HsxkdJvKZa2m2Num",
      "services" : {
          "password" : {
              "bcrypt" : "$2a$10$x/qUI.aEoFyfXT4Y3BJyQuxHX3NBKly3Cg76iJZz3Cm2tytgZi0JG"
          }
      },
      "emails" : [
          {
              "address" : "fxpage.biz@gmail.com",
              "verified" : true
          }
      ],
      "roles" : [
          "user"
      ],
      "firstName" : "Felix",
      "lastName" : "Page",
      "username" : "fxpage.biz",
      "mobilePhone" : "1111111",
      "pin" : "1111",
      "teamId" : "8J2CSuBwCmop7PQmh"
  }

  Transforms it into the Phoenix's app format:

    [
      {
        email: "user@example.com",
        first_name: "User"
        last_name: "Name",
        password: "",
        pin: "0000",
        roles: ["member"],
        meteor_team_id: team_id,
      }
    ]

  Throws an error if some of the attributes are not present
  """
  def parse_users_json(users) do
    users |> Enum.map(&parse_user_json/1)
  end

  def parse_user_json(%{
    "_id" => id,
    "services" => %{"password" => %{"bcrypt" => password_hash}},
    "emails" => [%{"address" => email}],
    "roles" => roles,
    "firstName" => first_name,
    "lastName" => last_name,
    "username" => username,
    "mobilePhone" => phone_number,
    "pin" => pin,
    "teamId" => team_id}) when is_list(roles) do

    %{
      email: email,
      username: username,
      first_name: first_name,
      last_name: last_name,
      password: encode_password(password_hash),
      phone_number: phone_number,
      pin: pin,
      roles: map_roles(roles),
      meteor_id: id,
      meteor_team_id: team_id,
    }
  end
  def parse_user_json(json) do
    raise ParserError, message: "Invalid format from Meteor app: #{inspect(json)}"
  end

  @doc """
  Expected format

    [
      {
        email: "user@example.com",
        first_name: "User"
        last_name: "Name",
        username: "username",
        password: "password_hash",
        phone_number: "+12345678910"
        pin: "0000",
        roles: ["member"],
        team_id: team_id,
      },
      ...
    ]
  """
  def migrate_users(team_id, users) do
    users = users |> Enum.map(& user_attributes(team_id, &1))
    Repo.insert_all(User, users)
  end

  def user_attributes(team_id, %{
    email: email,
    username: username,
    first_name: first_name,
    last_name: last_name,
    pin: pin,
    roles: roles,
    password: password}) do

    %{team_id: team_id,
      email: email,
      username: username,
      first_name: first_name,
      last_name: last_name,
      pin: pin,
      roles: roles,
      password_hash: password,
      inserted_at: DateTime.utc_now(),
      updated_at: DateTime.utc_now(),
      onboarded: true}
  end
  def user_attributes(json), do: raise ParserError, message: "Invalid format for Phoenix app: #{inspect(json)}"

  @doc """
  Encode password hash the same it's encoded in the Meteor app.
  This allows it to be seamlessly used in the Phoenix app.
  """
  def encode_password(password) when is_binary(password) do
    Base.encode16(:crypto.hash(:sha256, password), case: :lower)
  end

  @doc """
  Maps roles from Meteor the app to roles in the Phoenix app.

    user => member
    admin => admin
    superAdmin => admin

  """
  def map_roles(roles) do
    Enum.map(roles, fn
      "user" -> "member"
      "admin" -> "admin"
      "billing-admin" -> "admin"
      "superAdmin" -> "admin"
      role -> raise ParserError, message: "Invalid role format: #{inspect(role)}"
    end)
  end
end

Stitch.Migrate.run_migration
