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

  @doc """
  Finds a team member by email
  """
  @spec team_member_with_email(integer, binary) :: User.t | nil
  def team_member_with_email(team_id, email) do
    query =
      from u in User,
      where: u.team_id == ^team_id,
      where: u.onboarded == ^true,
      where: fragment("LOWER(?) = LOWER(?)", u.email, ^email)
    Repo.one(query)
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

  @doc """
  Finds a user by id
  """
  @spec get_by_id(pos_integer) :: User.t() | nil
  def get_by_id(user_id) do
    Repo.get(User, user_id)
  end

  @doc """
  Finds an active user by id
  """
  @spec get_active_by_id(pos_integer) :: User.t() | nil
  def get_active_by_id(user_id) do
    Repo.get_by(User, id: user_id, disabled: false)
  end

  @doc """
  Find a user by authentication token.
  """
  @spec get_by_token(binary) :: User.t() | nil
  def get_by_token(token) do
    Repo.get_by(User, token: token)
  end

  @doc """
  Find an active user by authentication token
  """
  @spec get_active_by_token(binary) :: User.t() | nil
  def get_active_by_token(token) do
    Repo.get_by(User, token: token, disabled: false)
  end

  def user_with_email_exists?(email) do
    query =
      from u in User,
      select: count(u.id),
      where: u.onboarded == ^true,
      where: fragment("LOWER(?) = LOWER(?)", u.email, ^email)
    Repo.one!(query) > 0
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
