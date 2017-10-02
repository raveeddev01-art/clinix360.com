defmodule Stitch.GroupQueries do
  @moduledoc """
  Module in charge of all group related queries.
  """

  alias Stitch.{Repo, Group, GroupUser}
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
    {:ok, Repo.all(query)}
  end

  defp load_groups_for_user(query, user_id) do
    query
    |> join(:left, [g], gu in GroupUser, gu.group_id == g.id and gu.user_id == ^user_id)
    |> preload(:users) # TODO: do not preload all team users by default
    |> where([g, gu], g.public or not is_nil(gu.id))
    |> select([g, gu], %{
      group: g,
      joined: not is_nil(gu.id),
      favorite: not is_nil(gu.id) and gu.is_favorite,
      unread_messages_count: gu.unread_messages_count,
      mentions_count: gu.mentions_count,
      last_read_at: type(fragment("COALESCE(?, ?)", gu.last_read_at, g.inserted_at), :naive_datetime),
    })
    |> Repo.all
    |> Enum.map(fn group ->
      {group, group_info} = Map.pop(group, :group)
      Map.merge(group, group_info)
    end)
  end

  def load_user_data(group, %User{id: user_id}), do: load_user_data(group, user_id)
  def load_user_data(%Group{id: group_id}, user_id) do
    Group
    |> where(id: ^group_id)
    |> load_groups_for_user(user_id)
    |> List.first
  end

  @doc """
  Returns group with the exist matching id.
  """
  def get_by_id(id, %User{team_id: team_id, id: user_id}) do
    group = Group
    |> where(team_id: ^team_id, id: ^id)
    |> load_groups_for_user(user_id)
    |> List.first

    if group, do: {:ok, group}, else: {:error, "Group with that id not found."}
  end
  def get_by_id(id, user_id), do: get_by_id(id, Repo.get!(User, user_id))

  def get_by_id(id), do: Repo.get(Group, id)

  @doc """
  Returns group with the exist matching slug for the user's team.
  """
  def find_by_slug(slug, %User{team_id: team_id, id: user_id}) do
    group = Group
    |> where(team_id: ^team_id, slug: ^slug)
    |> load_groups_for_user(user_id)
    |> List.first

    if group, do: {:ok, group}, else: {:error, "Group with that slug not found."}
  end
  def find_by_slug(slug, user_id), do: find_by_slug(slug, Repo.get!(User, user_id))

  @doc """
  Returns a list of public groups for the user's team, and
  also teams he's been invited to participate in.
  """
  def available_groups(%User{team_id: team_id, id: user_id}) do
    Group
    |> where(team_id: ^team_id)
    |> load_groups_for_user(user_id)
  end
  def available_groups(user_id), do: available_groups(Repo.get!(User, user_id))

  @doc """
  Returns a list of visible groups for the user given
  a search term.
  """
  def search(term, %User{team_id: team_id, id: user_id}) do
    Group
    |> where(team_id: ^team_id)
    |> where([g], ilike(g.name, ^"%#{term}%") or ilike(g.slug, ^"%#{term}%"))
    |> load_groups_for_user(user_id)
  end
  def search(slug, user_id), do: search(slug, Repo.get!(User, user_id))
end
