defmodule Stitch.MeteorMigration.User do
  alias Stitch.{Repo, Group}
  alias Stitch.{Accounts.User}
  require Logger

  import Ecto.Query
  import Ecto.Changeset

  defmodule ParserError do
    defexception message: "Invalid JSON format"
  end

  @meteor_migration_debug System.get_env("METEOR_MIGRATION_DEBUG")

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
    users
    |> Enum.map(&parse_user_json/1)
    |> Enum.filter(& &1 != nil)
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
    "teamId" => team_id} = attributes) when is_list(roles) do

    %{
      email: email,
      username: username,
      first_name: first_name,
      last_name: last_name,
      password: password_hash,
      phone_number: phone_number,
      pin: pin,
      disabled: attributes["active"] == false,
      roles: map_roles(roles, attributes["guestMulti"]),
      meteor_guest_rooms: parse_guest_rooms(attributes["guestRooms"]),
      meteor_id: id,
      meteor_team_id: team_id,
    }
  end
  def parse_user_json(json) do
    raise ParserError, message: "Invalid format from Meteor app: #{inspect(json)}"
  end

  def parse_guest_rooms(nil), do: nil
  def parse_guest_rooms(room_ids) do
    room_ids
    |> Enum.filter(& &1 != nil)
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
    disabled: disabled,
    password: password}) do

    %{team_id: team_id,
      email: email,
      username: username,
      first_name: first_name,
      last_name: last_name,
      pin: pin,
      roles: roles,
      disabled: disabled,
      password_hash: password,
      token: token(),
      inserted_at: DateTime.utc_now(),
      updated_at: DateTime.utc_now(),
      onboarded: true}
  end
  def user_attributes(json), do: raise ParserError, message: "Invalid format for Phoenix app: #{inspect(json)}"

  @doc """
  Maps roles from the Meteor app to roles in the Phoenix app.

    user => member
    admin => admin
    billing-admin => admin
    superAdmin => admin
    guestuser => "multi-room-guest" or "single-room-guest"

  """
  def map_roles(roles, is_multi_guest \\ false) do
    roles
    |> Enum.map(fn
      "user" -> "member"
      "admin" -> "admin"
      "billing-admin" -> "admin"
      "superAdmin" -> "admin"
      "guestuser" -> if is_multi_guest, do: "multi-room-guest", else: "single-room-guest"
      role ->
        Logger.error("Invalid role format: #{inspect(role)}")
        nil
    end)
    |> Enum.filter(& &1 != nil)
    |> Enum.uniq
    |> enforce_guest()
    |> enforce_admin()
  end

  def enforce_guest(roles) do
    if "multi-room-guest" in roles || "single-room-guest" in roles do
      roles -- ["member", "admin"]
    else
      roles
    end
  end

  def enforce_admin(roles) do
    if "admin" in roles do
      roles -- ["member", "multi-room-guest", "single-room-guest"]
    else
      roles
    end
  end

  def enforce_default_group_membership(team_id, users) do
    default_group = Group |> where(team_id: ^team_id) |> where(is_default: ^true) |> Repo.one()

    Enum.each(users, fn user ->
      unless Stitch.Accounts.User.guest?(user) do
        unless Stitch.GroupAuthorization.is_member?(default_group.id, user.id) do
          Stitch.Group.add_user(default_group, user.id)
        end
      end
    end)
  end

  def restoring_guest_membership(indexed_meteor_users, indexed_users, indexed_meteor_rooms) do
    Enum.each(indexed_users, fn {username, user_object} ->
      if Stitch.Accounts.User.guest?(user_object) do
        meteor_user = indexed_meteor_users[username]

        meteor_room_ids = meteor_user.meteor_guest_rooms
          |> Enum.map(fn meteor_room_id ->
            meteor_room = indexed_meteor_rooms[meteor_room_id]
            if meteor_room, do: meteor_room.id
          end)
          |> Enum.filter(& &1 != nil)

        user_group_ids = Stitch.GroupUser |> where(user_id: ^user_object.id) |> select([gu], gu.group_id) |> Repo.all

        if @meteor_migration_debug do
          Logger.info("Guest username: #{meteor_user.username}")
          Logger.info(inspect(%{"#{meteor_user.username} meteor_group_ids" => meteor_room_ids}))
          Logger.info(inspect(%{"#{meteor_user.username} migrated_group_ids" => user_group_ids}))
        end

        remaining_guest_group_ids = Enum.uniq(meteor_room_ids -- user_group_ids)

        if Enum.any?(remaining_guest_group_ids) do
          if @meteor_migration_debug do
            Logger.info("Adding #{meteor_user.username} to #{remaining_guest_group_ids}")
          end

          remaining_guest_group_ids |> Enum.each(fn group_id ->
            Stitch.Group.add_user(%Stitch.Group{id: group_id}, user_object)
          end)
        end

        user_group_ids = Stitch.GroupUser |> where(user_id: ^user_object.id) |> select([gu], gu.group_id) |> Repo.all
        updated_role = if Enum.count(user_group_ids) > 1, do: "multi-room-guest", else: "single-room-guest"

        if @meteor_migration_debug do
          Logger.info(inspect(%{"#{meteor_user.username} group_as_guest" => user_group_ids}))
          Logger.info(inspect(%{"#{meteor_user.username} role" => updated_role}))
        end

        user_object
        |> change(groups_as_guest: user_group_ids, role: [updated_role])
        |> Stitch.Repo.update
      end
    end)
  end

  def token do
    Stitch.Rand.token(32)
  end
end