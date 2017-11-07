defmodule Stitch.UserQueries do
  import Ecto.Query
  alias Stitch.{Repo, Team}
  alias Stitch.Accounts.User

  @doc """
  Returns a list of onboarded users for the given search term.
  """
  def search(user_id, term) do
    user = Repo.get!(User, user_id)
    team = Repo.get!(Team, user.team_id)

    query =
      from u in User,
      where: u.team_id == ^team.id,
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
      where: u.email == ^email
    Repo.one(query)
  end
  def team_member_with_email(_, _) do
    {:error, "team_id must be an integer"}
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
    case Repo.get_by(User, token: token) do
      nil ->
        {:not_found, "User with token #{token} was not found."}
      user ->
        user
    end
  end

  def get_by_token(_) do {:error, "Token is malformed."} end

  def user_with_email_exists?(email) do
    Repo.one!(from u in User, select: count(u.id), where: u.email == ^email) > 0
  end
end
