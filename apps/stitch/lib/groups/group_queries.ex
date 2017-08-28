defmodule Stitch.GroupQueries do
  @moduledoc """
  Module in charge of all group related queries.
  """

  alias Stitch.{Repo, Group, GroupUser, Message}
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

  defp load_groups_for_user(query, %{id: user_id, favorite_groups: favorite_groups}) do
    mention_count = load_mention_count(query, %{id: user_id})

    query
    |> join(:left, [g], gu in GroupUser, gu.group_id == g.id and gu.user_id == ^user_id)
    |> where([g, gu], g.public or not is_nil(gu.id))
    |> join(:left, [g, gu], m in Message, not is_nil(gu.id) and m.group_id == g.id and m.user_id != ^user_id
      and not fragment("? \\? ?", m.read_status, ^to_string(user_id)))
    |> preload(:users)
    |> group_by([g, gu], [g.id, gu.id])
    |> select([g, gu, m], {g, not is_nil(gu.id), count(m.id)})
    |> Repo.all
    |> Enum.map(fn {group, joined, unread_messages_count} ->
      group
      |> Map.put_new(:joined, joined)
      |> Map.put_new(:unread_messages_count, unread_messages_count)
      |> Map.put_new(:favorite, Enum.member?(favorite_groups, group.id))
      |> Map.put_new(:mentions_count, mention_count[group.id])
    end)
  end

  def load_mention_count(query, %{id: user_id}) do
    query
    |> join(:left, [g], gu in GroupUser, gu.group_id == g.id and gu.user_id == ^user_id)
    |> where([g, gu], g.public or not is_nil(gu.id))
    |> select([g, gu], {g.id, fragment("""
      COALESCE(ARRAY_LENGTH(ARRAY(SELECT JSONB_OBJECT_KEYS(?)), 1), 0)
    """, gu.mentioning_message_ids)})
    |> Repo.all
    |> Enum.reduce(%{}, fn ({id, mention_counter}, acc) ->
      Map.put(acc, id, mention_counter)
    end)
  end

  def load_user_data(%Group{id: group_id}, %{} = user) do
    Group
    |> where(id: ^group_id)
    |> load_groups_for_user(user)
    |> List.first
  end
  def load_user_data(group, user_id), do: load_user_data(group, Repo.get!(User, user_id))

  @doc """
  Returns group with the exist matching id.
  """
  def get_by_id(id, %{} = user) do
    group = Group
    |> where(team_id: ^user.team_id, id: ^id)
    |> load_groups_for_user(user)
    |> List.first

    if group, do: {:ok, group}, else: {:error, "Group with that id not found."}
  end
  def get_by_id(id, user_id), do: get_by_id(id, Repo.get!(User, user_id))

  def get_by_id(id), do: Repo.get(Group, id)

  @doc """
  Returns group with the exist matching slug for the user's team.
  """
  def find_by_slug(slug, %{} = user) do
    group = Group
    |> where(team_id: ^user.team_id, slug: ^slug)
    |> load_groups_for_user(user)
    |> List.first

    if group, do: {:ok, group}, else: {:error, "Group with that slug not found."}
  end
  def find_by_slug(slug, user_id), do: find_by_slug(slug, Repo.get!(User, user_id))

  @doc """
  Returns a list of public groups for the user's team, and
  also teams he's been invited to participate in.
  """
  def available_groups(%{} = user) do
    Group
    |> where(team_id: ^user.team_id)
    |> load_groups_for_user(user)
  end
  def available_groups(user_id), do: available_groups(Repo.get!(User, user_id))

  @doc """
  Returns a list of visible groups for the user given
  a search term.
  """
  def search(term, %{} = user) do
    Group
    |> where(team_id: ^user.team_id)
    |> where([g], ilike(g.name, ^"%#{term}%") or ilike(g.slug, ^"%#{term}%"))
    |> load_groups_for_user(user)
  end
  def search(slug, user_id), do: search(slug, Repo.get!(User, user_id))
end
