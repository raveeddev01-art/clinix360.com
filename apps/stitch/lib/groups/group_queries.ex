defmodule Stitch.GroupQueries do
  @moduledoc """
  Module in charge of all group related queries.
  """

  alias Stitch.{Repo, Group, GroupUser, Team}
  alias Stitch.Accounts.User
  import Ecto.Query

  @dm_groups ["__dm_group__", "__multi_dm_group__"]

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

  defp load_groups_for_user(query, %User{} = user) do
    # TODO: refactor
    query =
      if User.guest?(user) do
        from g in query,
        left_join: gu in GroupUser, on: gu.group_id == g.id and gu.user_id == ^user.id,
        join: u in User, on: u.id == ^user.id,
        where: not is_nil(gu.id),
        preload: :users, # TODO: do not preload all team users by default
        select: %{
          group: g,
          joined: not is_nil(gu.id),
          is_favorite: not is_nil(gu.id) and gu.is_favorite,
          is_hidden: not is_nil(gu.id) and gu.is_hidden,
          unread_messages_count: gu.unread_messages_count,
          mentions_count: gu.mentions_count,
          last_read_at: type(fragment("COALESCE(?, ?)", gu.last_read_at, gu.inserted_at), :naive_datetime),
        }
      else
        from g in query,
        left_join: gu in GroupUser, on: gu.group_id == g.id and gu.user_id == ^user.id,
        join: u in User, on: u.id == ^user.id,
        where: g.public or not is_nil(gu.id),
        preload: :users, # TODO: do not preload all team users by default
        select: %{
          group: g,
          joined: not is_nil(gu.id),
          is_favorite: not is_nil(gu.id) and gu.is_favorite,
          is_hidden: not is_nil(gu.id) and gu.is_hidden,
          unread_messages_count: gu.unread_messages_count,
          mentions_count: gu.mentions_count,
          last_read_at: type(fragment("COALESCE(?, ?)", gu.last_read_at, gu.inserted_at), :naive_datetime),
        }
      end

    query
    |> Repo.all()
    |> Enum.map(fn group ->
      {group, group_info} = Map.pop(group, :group)
      Map.merge(group, group_info)
    end)
  end

  def load_user_data(%Group{id: group_id}, user) do
    Group
    |> where(id: ^group_id)
    |> load_groups_for_user(user)
    |> List.first
  end

  @doc """
  Returns group with the exist matching id.
  """
  def get_by_id(id, %User{team_id: team_id, id: user_id} = user) do
    group = Group
    |> where(team_id: ^team_id, id: ^id)
    |> load_groups_for_user(user)
    |> List.first

    if group, do: {:ok, group}, else: {:error, "Room with that id not found."}
  end
  def get_by_id(%Team{id: team_id}, group_id) do
    Repo.get_by(Group, id: group_id, team_id: team_id)
  end
  def get_by_id(id, user_id), do: get_by_id(id, Repo.get!(User, user_id))

  def get_by_id(id), do: Repo.get(Group, id)

  @doc """
  Fetches a list of groups by list of group ids
  ## Examples
      iex> get_by_ids([1, 2], %User{...})
      [%Group{id: 1}, %Group{id: 2}]
  """
  @spec get_by_ids([pos_integer], %User{}) :: [Group.t]
  def get_by_ids(ids, %User{team_id: team_id}) when is_list(ids) do
    query =
      from g in Group,
      where: g.team_id == ^team_id,
      where: g.id in ^ids

    Repo.all(query)
  end

  @doc """
  Returns group with the exist matching slug for the user's team.
  """
  def find_by_slug(slug, %User{team_id: team_id} = user) do
    group = Group
    |> where(team_id: ^team_id, slug: ^slug)
    |> load_groups_for_user(user)
    |> List.first

    if group, do: {:ok, group}, else: {:error, "Room with that slug not found."}
  end

  @doc """
  Returns a list of public groups for the user's team, and
  also teams he's been invited to participate in.
  """
  def available_groups(%User{team_id: team_id} = user) do
    Group
    |> where(team_id: ^team_id)
    |> load_groups_for_user(user)
  end
  def available_groups(user_id), do: available_groups(Repo.get!(User, user_id))

  @doc """
  Returns a list of visible groups for the user given
  a search term.
  """
  def search(term, %User{team_id: team_id} = user) do
    Group
    |> where(team_id: ^team_id)
    |> where([g], ilike(g.name, ^"%#{term}%") or ilike(g.slug, ^"%#{term}%"))
    |> load_groups_for_user(user)
  end
  def search(slug, user_id), do: search(slug, Repo.get!(User, user_id))

  @doc """
  Returns the default group for a given team via a user.

  The default group is the first group created for a team and will always exist.
  """
  @spec default_group(User.t) :: Group.t
  def default_group(%User{team_id: team_id, groups_as_guest: []}) do
    Group
    |> where(team_id: ^team_id)
    |> where(is_default: ^true)
    |> Repo.one()
  end

  def default_group(%User{team_id: team_id, groups_as_guest: groups_as_guest}) do
    first_group_id = Enum.at(groups_as_guest, 0)
    Repo.get_by(Group, id: first_group_id, team_id: team_id)
  end

  @doc """
  Checks if a guest can initiate a direct message with the given users.
  A guest user is expected to always be in a member of the restricted groups. The guest is also expected
  to be in the list of user ids.
  Each user should be a member in at least one of the restricted group for the DM to be valid.
  """
  @spec valid_guest_direct_message?([pos_integer], [pos_integer]) :: boolean
  def valid_guest_direct_message?(restricted_group_ids, user_ids) do
    query =
      from gu in GroupUser,
      where: gu.group_id in ^restricted_group_ids,
      where: gu.user_id in ^user_ids,
      select: count(gu.user_id, :distinct)
    Repo.one(query) == length(user_ids)
  end

  @doc """
  Lists all non-DM groups a user is currently a member of.
  """
  @spec non_dm_group_memberships(User.t) :: [GroupUser.t]
  def non_dm_group_memberships(%User{id: user_id}) do
    query =
      from gu in GroupUser,
      join: g in assoc(gu, :group),
      where: gu.user_id == ^user_id,
      where: g.name not in ^@dm_groups,
      preload: [group: g]
    Repo.all(query)
  end
end
