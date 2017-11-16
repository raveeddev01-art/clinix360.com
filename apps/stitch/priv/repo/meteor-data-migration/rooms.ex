defmodule Stitch.Migrate.Rooms do
  alias Stitch.Repo
  alias Stitch.{Accounts.User}

  defmodule ParserError do
    defexception message: "Invalid JSON format"
  end

  defmodule RelationError do
    defexception message: "Foreign-key refers to an non-existing record"
  end

  def parse_rooms_json(users) do
    users |> Enum.map(&parse_room_json/1)
  end

  @doc """
  `users` is a map of users beloning to this team with meteor_username used as key
  """
  def parse_room_json(users, %{
    "_id" => meteor_id,
    "t" => "public-ch",
    "name" => slug,
    "usernames" => usernames,
    "u" => { "username" => meteor_creator_username },
    "teamId" => meteor_team_id } = attributes) do

    case Map.fetch(users, meteor_creator_username) do
      {:ok, user} ->
        %{
          name: Map.get(attributes, "fname", name),
          slug: slug,
          public: true,
          creator_user_id: user.id,
          is_default: !!attributes["default"]
        }
      :error -> raise RelationError
    end
  end

  def parse_room_json(users, %{
    "_id" => meteor_id,
    "t" => "private-ch",
    "name" => slug,
    "usernames" => usernames,
    "u" => { "username" => meteor_creator_username },
    "teamId" => meteor_team_id } = attributes) do

    case Map.fetch(users, meteor_creator_username) do
      {:ok, user} ->
        %{
          name: Map.get(attributes, "fname", name),
          slug: slug,
          public: true,
          creator_user_id: user.id,
          is_default: !!attributes["default"]
        }
      :error -> raise RelationError
    end
  end

  def parse_room_json(users, %{
    "_id" => meteor_id,
    "usernames" => usernames,
    "teamId" => meteor_team_id,
    "t" => "direct-ch"} = attributes) do

    user_ids = get_user_ids(users, usernames)

    %{
      dm: true
      multi: !!attributes["multi"],
      user_ids: user_ids
    }
  end

  def get_user_ids(users, usernames) do
    Enum.map(usernames, fn username ->
      case Map.fetch(users, username) do
        {:ok, user} -> user.id
        :error -> raise RelationError
      end
    end)
  end

  def parse_user_json(json) do
    raise ParserError, message: "Invalid format from Meteor app: #{inspect(json)}"
  end
end
