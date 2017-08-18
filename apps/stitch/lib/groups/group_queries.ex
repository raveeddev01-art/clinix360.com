defmodule Stitch.GroupQueries do
  @moduledoc """
  Module in charge of all group related queries.
  """

  alias Stitch.{Repo, Team, Group, GroupUser}
  alias Stitch.Accounts.User
  import Ecto.Query

  @doc """
  Return true or false is user has joined the given group.
  """
  def user_is_member?(group_id, user_id) do
    Repo.get_by(GroupUser, user_id: user_id, group_id: group_id) != nil
  end

  @doc """
  Returns list of users within a group.
  """
  def get_users(group_id) do
    query =
      from u in User,
      join: gu in GroupUser,
      where: gu.group_id == ^group_id,
      where: gu.user_id == u.id
    users = Repo.all(query)
    {:ok, users}
  end

  @doc """
  Returns group with the exist matching id.
  """
  def get_by_id(id) do
    query =
      from g in Group,
      where: g.id == ^id,
      preload: [:users]
    case Repo.one(query) do
      nil ->
        {:error, "Group with that id not found."}
      group ->
        {:ok, group}
    end
  end

  @doc """
  Returns group with the exist matching slug for the user's team.
  """
  def find_by_slug(slug, user_id) do
    user = Repo.get(User, user_id)
    query =
      from g in Group,
      where: g.team_id == ^user.team_id,
      where: g.slug == ^slug,
      preload: [:users]
    case Repo.one(query) do
      nil ->
        {:error, "Group with that slug not found."}
      group ->
        {:ok, group}
    end
  end

  @doc """
  Returns a list of public groups for the user's team, and
  also teams he's been invited to participate in.
  """
  def available_groups(user_id) do
    user = Repo.get!(User, user_id)

    Group
    |> where(team_id: ^user.team_id)
    |> join(:left, [g], gu in GroupUser, gu.group_id == g.id and gu.user_id == ^user.id)
    |> where([g, gu], g.public or not is_nil(gu.id))
    |> preload(:users)
    |> Repo.all
  end

  @doc """
  Returns a list of visible groups for the user given
  a search term.
  """
  def search(user_id, term) do
    user = Repo.get(User, user_id)
    team = Repo.get(Team, user.team_id)

    public_groups =
      from g in Group,
      where: g.team_id == ^team.id,
      where: g.public == ^true,
      where: ilike(g.name, ^"%#{term}%") or ilike(g.slug, ^"%#{term}%"),
      preload: [:users],
      select: g

    participating_groups =
      from g in Group,
      join: gu in GroupUser,
      where: gu.group_id == g.id,
      where: gu.user_id == ^user.id,
      where: ilike(g.name, ^"%#{term}%") or ilike(g.slug, ^"%#{term}%"),
      preload: [:users],
      select: g

    public_groups = Repo.all(public_groups)
    participating_groups = Repo.all(participating_groups)
    result_groups = public_groups ++ participating_groups

    result_groups
    |> Enum.uniq
  end
end
