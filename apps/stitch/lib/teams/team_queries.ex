defmodule Stitch.TeamQueries do
  import Ecto.Query
  alias Stitch.{Repo, Team}
  alias Stitch.Accounts.{User, Role}

  @guest_roles Role.guests()

  def all_with_user_email(email) do
    Team
    |> join(:inner, [t], u in User, u.team_id == t.id and u.email == ^email)
    |> select([t, u], t)
    |> Repo.all()
  end

  def get_by_id(id) when is_binary(id), do: get_by_id(String.to_integer(id))

  def get_by_id(id) do
    Repo.get(Team, id)
  end

  def get_by_slug(slug) when byte_size(slug) > 0 do
    query =
      from t in Team,
      left_join: s in assoc(t, :subscription),
      where: t.slug == ^slug,
      preload: [subscription: s]

    Repo.one(query)
  end

  def get_by_slug(_), do: nil

  @doc """
  Returns a list of currently active/onboarded users for a team.

  ## Examples

      iex> list_active_users(%Team{...})
      [%User{...}, %User{...}, ...]

  """
  @spec list_active_users(Team.t()) :: [User.t()]
  def list_active_users(%Team{id: team_id}) do
    query =
      from(
        u in User,
        where: u.onboarded == true,
        where: u.disabled == false,
        where: u.team_id == ^team_id
      )

    Repo.all(query)
  end

  @doc """
  Returns a list of users for a team.

  ## Examples

      iex> list_users(%Team{...})
      [%User{...}, %User{...}, ...]

  """
  @spec list_users(Team.t()) :: [User.t()]
  def list_users(%Team{id: team_id}) do
    query = from(u in User, where: u.team_id == ^team_id)
    Repo.all(query)
  end

  @doc """
  Lists all active user ids in a team that do not have a guest role and aren't in the given list of ids.
  """
  @spec list_non_member_non_guest_ids(pos_integer, [pos_integer]) :: [pos_integer]
  def list_non_member_non_guest_ids(team_id, member_ids) do
    query =
      from(
        u in User,
        where: u.onboarded == true,
        where: u.disabled == false,
        where: u.team_id == ^team_id,
        where: not fragment("? && ?", ^@guest_roles, u.roles),
        where: u.id not in ^member_ids,
        select: u.id
      )

    Repo.all(query)
  end

  @doc """
  Returns admin users
  """
  @spec list_admins(Team.t()) :: [User.t()]
  def list_admins(%Stitch.Team{id: team_id}) do
    User
    |> where(team_id: ^team_id)
    |> where([u], fragment("? @> ?", u.roles, ^["admin"]))
    |> Repo.all()
  end

  @doc """
  Returns a list of teams with user counts
  """
  @spec admin_teams_query() :: Ecto.Query.t()
  def admin_teams_query do
    from(
      t in Team,
      left_join: u in assoc(t, :users),
      select: %{
        name: t.name,
        slug: t.slug,
        total_users: count(u.id),
        enabled_users: fragment("SUM(CASE WHEN ? = ? THEN 1 ELSE 0 END)", u.disabled, false),
        disabled_users: fragment("SUM(CASE WHEN ? = ? THEN 1 ELSE 0 END)", u.disabled, true)
      },
      order_by: t.name,
      group_by: t.id
    )
  end

  @doc """
  Returns the team owner who originally created the team.

  ## Examples

      iex> get_team_owner(%Team{...})
      %User{...}

  """
  def get_team_owner(%Team{id: team_id}) do
    query =
      from(
        u in User,
        where: u.team_id == ^team_id,
        where: "admin" in u.roles,
        order_by: [asc: :inserted_at],
        limit: 1
      )

    Repo.one(query)
  end

  @doc """
  Returns a list of all teams.

  ## Examples

      iex> list_teams()
      [%Team{...}, %Team{...}, ...]

  """
  @spec list_teams :: [Team.t()]
  def list_teams, do: Repo.all(Team)

  @doc """
  Deactivate all geust users
  """
  def deactivate_all_guests(%Team{id: team_id})  do
    query =
      from u in User,
      where: u.team_id == ^team_id,
      where: fragment("? && ?", ^@guest_roles, u.roles),
      update: [
        set: [disabled: true]
      ]

    Repo.update_all(query, [], returning: true)
  end
end
