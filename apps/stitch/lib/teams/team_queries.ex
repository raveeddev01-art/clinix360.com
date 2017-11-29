defmodule Stitch.TeamQueries do
  import Ecto.Query
  alias Stitch.Accounts.User
  alias Stitch.{Repo, Team}

  def all_with_user_email(email) do
    Team
    |> join(:inner, [t], u in User, u.team_id == t.id and u.email == ^email)
    |> select([t, u], t)
    |> Repo.all
  end

  def get_by_id(id) when is_binary(id), do: get_by_id(String.to_integer(id))
  def get_by_id(id) do
    Repo.get(Team, id)
  end

  def get_by_slug(slug) when byte_size(slug) > 0 do
    Repo.get_by(Team, slug: slug)
  end
  def get_by_slug(_), do: nil

  @doc """
  Returns a list of currently active/onboarded users for a team.

  ## Examples

      iex> list_active_users(%Team{...})
      [%User{...}, %User{...}, ...]

  """
  @spec list_active_users(Team.t) :: [User.t]
  def list_active_users(%Team{id: team_id}) do
    query =
      from u in User,
      where: u.onboarded == true,
      where: u.disabled == false,
      where: u.team_id == ^team_id
    Repo.all(query)
  end

  @doc """
  Returns a list of users for a team.

  ## Examples

      iex> list_users(%Team{...})
      [%User{...}, %User{...}, ...]

  """
  @spec list_users(Team.t) :: [User.t]
  def list_users(%Team{id: team_id}) do
    query =
      from u in User,
      where: u.team_id == ^team_id
    Repo.all(query)
  end

  @doc """
  Returns the team owner who originally created the team.

  ## Examples

      iex> get_team_owner(%Team{...})
      %User{...}

  """
  def get_team_owner(%Team{id: team_id}) do
    query =
      from u in User,
      where: u.team_id == ^team_id,
      where: "admin" in u.roles,
      order_by: [asc: :inserted_at],
      limit: 1
    Repo.one(query)
  end

  @doc """
  Returns a list of all teams.

  ## Examples

      iex> list_teams()
      [%Team{...}, %Team{...}, ...]

  """
  @spec list_teams :: [Team.t]
  def list_teams, do: Repo.all(Team)
end
