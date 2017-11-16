defmodule Stitch.Migrate do
  alias Stitch.Repo
  alias Stitch.{Accounts, Accounts.User}
  alias Stitch.{Team, Group, GroupUser, Message}

  defmodule ParserError do
    defexception message: "Invalid JSON format"
  end

  def run_migration(users_json_file) do
    # Parse json file (stop if there are errors -- it means we won't be able to insert all records into the database)
  end

  def parse_team_json(team) do
    # TODO:
  end

  @doc """
  Expected format

    [{name: "team name", slug: "team_slug"}, ...]

  """
  def migrate_team(teams) do
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
        team_id: team_id,
      }
    ]

  Throws and error if some of the attributes are not present
  """
  def parse_users_json(team, users) do
    # TODO:
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
        pin: "0000",
        roles: ["member"],
        team_id: team_id,
      },
      ...
    ]
  """
  def migrate_users(team_id, users) do
    users = users |> Enum.map(&user_attributes/1)
    Repo.insert_all(User, users)
  end)

  def user_attributes(%{
    "email" => email,
    "username" => username,
    "first_name" => first_name,
    "last_name" => last_name,
    "pin" => pin,
    "roles" => roles,
    "password" => password}) do

    %{team_id: team_id
      email: email,
      username: username,
      first_name: first_name,
      last_name: last_name,
      pin: pin,
      roles: roles,
      password: password,
      inserted_at: DateTime.utc_now(),
      updated_at: DateTime.utc_now(),
      onboarded: true}
  end
  def user_attributes(json), do: raise ParserError, "Invalid format: inspect(json)"

  def encode_password(password) when is_binary(password) do
    Base.encode16(:crypto.hash(:sha256, password), case: :lower)
  end
end
