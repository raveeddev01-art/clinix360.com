defmodule Stitch.MeteorMigration.User do
  alias Stitch.Repo
  alias Stitch.{Accounts.User}

  defmodule ParserError do
    defexception message: "Invalid JSON format"
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
      password: password_hash,
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
    Repo.insert_all(User, users, returning: true)
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
      token: token(),
      inserted_at: DateTime.utc_now(),
      updated_at: DateTime.utc_now(),
      onboarded: true}
  end
  def user_attributes(json), do: raise ParserError, message: "Invalid format for Phoenix app: #{inspect(json)}"

  @doc """
  Maps roles from Meteor the app to roles in the Phoenix app.

    user => member
    admin => admin
    billing-admin => admin
    superAdmin => admin

  """
  def map_roles(roles) do
    roles
    |> Enum.map(fn
      "user" -> "member"
      "admin" -> "admin"
      "billing-admin" -> "admin"
      "superAdmin" -> "admin"
      role -> raise ParserError, message: "Invalid role format: #{inspect(role)}"
    end)
    |> Enum.uniq
  end

  def token do
    Stitch.Rand.token(32)
  end
end
