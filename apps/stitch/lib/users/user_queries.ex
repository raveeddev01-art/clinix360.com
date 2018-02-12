defmodule Stitch.UserQueries do
  import Ecto.Query
  alias Stitch.{Repo, Team, GroupUser, Group}
  alias Stitch.Accounts.User

  @doc """
  Returns a list of onboarded users for the given search term based on user.
  """
  def search(%User{team_id: team_id}, term) do
    query =
      from u in User,
      where: u.team_id == ^team_id,
      where: u.onboarded == true,
      where: ilike(u.first_name, ^"%#{term}%") or ilike(u.last_name, ^"%#{term}%") or ilike(u.username, ^"%#{term}%") or ilike(u.email, ^"%#{term}%"),
      select: u

    Repo.all(query)
  end

  def users_for_team(team_id) when is_integer(team_id) do
    query =
      from u in User,
      where: u.team_id == ^team_id,
      where: u.onboarded == ^true
    Repo.all(query)
  end
  def users_for_team(_) do
    {:error, "team_id must be an integer"}
  end

  def team_member_with_email(team_id, email) when is_integer(team_id) do
    query =
      from u in User,
      where: u.team_id == ^team_id,
      where: u.onboarded == ^true,
      where: fragment("LOWER(?) = LOWER(?)", u.email, ^email)
    Repo.one(query)
  end
  def team_member_with_email(_, _) do
    {:error, "team_id must be an integer"}
  end

  @doc """
  Finds a user by id based on a user team.
  """
  @spec find_user(pos_integer, User.t) :: User.t | nil
  def find_user(user_id, %User{team_id: team_id}) do
    Repo.get_by(User, id: user_id, team_id: team_id)
  end

  @doc """
  Finds a user belonging to a given team.
  """
  @spec team_member_by_id(Stitch.Team.t | pos_integer, pos_integer) :: User.t | nil
  def team_member_by_id(%Team{id: team_id}, user_id) do
    team_member_by_id(team_id, user_id)
  end
  def team_member_by_id(team_id, user_id) when is_integer(team_id) do
    Repo.get_by(User, id: user_id, team_id: team_id)
  end

  def get_all do
    Repo.all(from User)
  end

  def get_by_id(id) when is_integer(id) and id < 1 do
    {:error, "Id cannot be less than 1."}
  end

  def get_by_id(id) when is_integer(id) do
    case Repo.get(User, id) do
      nil -> {:not_found, "User with id #{id} was not found."}
      record -> record
    end
  end

  def get_by_id(_) do {:error, "Id isn't an integer."} end

  def get_by_token(token) when byte_size(token) == 32 do
    case Repo.get_by(User, token: token, disabled: false) do
      nil ->
        {:not_found, "User with token #{token} was not found."}
      user ->
        user
    end
  end

  def get_by_token(_) do {:error, "Token is malformed."} end

  @spec user_with_email_exists?(binary) :: boolean
  def user_with_email_exists?(email) do
    query =
      from u in User,
      where: u.onboarded == ^true,
      where: fragment("LOWER(?) = LOWER(?)", u.email, ^email),
      select: u.id,
      limit: 1
    !!Repo.one(query)
  end

  @doc """
  Returns ids of guest users in the group
  """
  @spec guest_user_ids(Group.t) :: [User.t]
  def guest_user_ids(%Group{} = group) do
    query =
      from u in User,
      join: gu in GroupUser, on: gu.user_id == u.id,
      where: gu.group_id == ^group.id,
      where: u.roles == ^["single-room-guest"] or u.roles == ^["multi-room-guest"],
      select: u.id
    Repo.all(query)
  end
end
