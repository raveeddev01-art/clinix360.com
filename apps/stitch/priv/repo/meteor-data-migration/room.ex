defmodule Stitch.MeteorMigration.Room do
  alias Stitch.Repo
  alias Stitch.{Group}
  import Ecto.Changeset
  require Logger

  defmodule ParserError do
    defexception message: "Invalid JSON format"
  end

  defmodule RelationError do
    defexception message: "Foreign-key refers to an non-existing record"
  end

  def parse_rooms_json(indexed_users, users) do
    users
    |> Enum.map(& parse_room_json(indexed_users, &1))
    |> Enum.filter(& &1 != nil)
  end

  @doc """
  `users` is a map of users beloning to this team with meteor_username used as key
  """
  def parse_room_json(users, %{
    "_id" => meteor_id,
    "t" => "public-ch",
    "name" => slug,
    "usernames" => usernames,
    "u" => %{ "username" => meteor_creator_username },
    "teamId" => _meteor_team_id } = attributes) do

    case Map.fetch(users, meteor_creator_username) do
      {:ok, user} ->
        %{
          name: parse_room_name(attributes),
          slug: slug,
          dm: false,
          public: true,
          description: attributes["topic"],
          creator_user: user,
          is_default: !!attributes["default"],
          users: get_users(users, usernames),
          meteor_id: meteor_id,
        }
      :error ->
        nil
    end
  end

  def parse_room_json(users, %{
    "_id" => meteor_id,
    "t" => "public-ch",
    "name" => slug,
    "default" => true,
    "usernames" => [meteor_creator_username | _] = usernames,
    "teamId" => _meteor_team_id } = attributes) do

    case Map.fetch(users, meteor_creator_username) do
      {:ok, user} ->
        %{
          name: parse_room_name(attributes),
          slug: slug,
          dm: false,
          public: true,
          description: attributes["topic"],
          creator_user: user,
          is_default: !!attributes["default"],
          users: get_users(users, usernames),
          meteor_id: meteor_id,
        }
      :error ->
        nil
    end
  end

  def parse_room_json(users, %{
    "_id" => meteor_id,
    "t" => "private-ch",
    "name" => slug,
    "usernames" => usernames,
    "u" => %{ "username" => meteor_creator_username },
    "teamId" => _meteor_team_id } = attributes) do

    case Map.fetch(users, meteor_creator_username) do
      {:ok, user} ->
        %{
          name: parse_room_name(attributes),
          slug: slug,
          dm: false,
          public: false,
          creator_user: user,
          description: attributes["topic"],
          is_default: !!attributes["default"],
          users: get_users(users, usernames),
          meteor_id: meteor_id,
        }
      :error ->
        nil
    end
  end

  def parse_room_json(users, %{
    "_id" => meteor_id,
    "usernames" => usernames,
    "teamId" => _meteor_team_id,
    "t" => "direct-ch"} = attributes) do

    %{
      dm: true,
      multi: !!attributes["multi"],
      users: get_users(users, usernames),
      meteor_id: meteor_id,
    }
  end

  def parse_room_name(attributes) do
    case Map.fetch(attributes, "fname") do
      {:ok, fname} ->
        String.replace(fname, ~r/[^\w-\s]/, "")
      :error -> Map.get(attributes, "name")
    end
  end

  def parse_user_json(json) do
    raise ParserError, message: "Invalid format from Meteor app: #{inspect(json)}"
  end

  def get_users(users, usernames) do
    Enum.map(usernames, fn username ->
      case Map.fetch(users, username) do
        {:ok, user} -> user
        :error ->
          Logger.warn "Found reference to a non-exisiting user: #{username}"
          nil
      end
    end)
    |> Enum.filter(& &1 != nil)
  end

  def migrate_rooms(team_id, rooms) do
    rooms |> Enum.map(fn room ->
      case create_group(team_id, room) do
        {:ok, %{group: group}} -> {group, room.meteor_id}
        {:ok, group} -> {group, room.meteor_id}
        error ->
          Logger.warn("Error creating group #{inspect(room)}")
          Logger.warn(inspect(error))
          nil
      end
    end)
    |> Enum.filter(& &1 != nil)
  end

  def create_group(_team_id, %{dm: true, multi: _multi, users: []}) do
    {:error, "Empty room"}
  end

  def create_group(_team_id, %{dm: true, multi: true, users: [creator|_] = users}) do
    user_ids = Enum.map(users, & &1.id)
    Group.create_multi_dm(creator, user_ids)
  end

  def create_group(_team_id, %{dm: true, multi: false, users: [creator|_] = users}) do
    user_ids = Enum.map(users, & &1.id)
    Group.create_single_dm(creator, user_ids)
  end

  def create_group(team_id, %{dm: false, users: users, name: name, slug: slug, public: public, creator_user: creator, is_default: is_default}) do
    user_ids = Enum.map(users, & &1.id)
    group_params = %{
      "name" => name,
      "slug" => slug,
      "user_ids" => user_ids,
      "public" => public,
    }
    group = Group.create(creator, group_params)

    case group do
      {:ok, group} = group_inserted ->
        if is_default == true do
          unless Repo.get_by(Group, team_id: team_id, is_default: true) do
            group
            |> change(is_default: true)
            |> Repo.update
          end

          group_inserted
        else
          unless Enum.member?(user_ids, creator.id) do
            Group.remove_user(group, creator.id)
          end

          group_inserted
        end

        unless public do
          group |> change(public: false) |> Repo.update
        end
      group -> group
    end
  end
end