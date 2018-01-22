defmodule Stitch.Group do
  use Ecto.Schema
  import Ecto.Query
  import Ecto.Changeset
  alias Stitch.Accounts.{User, Role}
  alias Stitch.{Repo, Group, GroupUser, Message}

  @type t :: %__MODULE__{}
  @guest_roles Role.guests()
  @dm_groups ["__dm_group__", "__multi_dm_group__"]
  @type membership_changes :: {removed_users :: [User.t], added_users :: [User.t]}

  schema "groups" do
    belongs_to :creator, User, foreign_key: :creator_user_id
    # __multi_dm_group__ and __dm_group__ are reversed group names for dm groups
    field :name, :string
    field :slug, :string
    field :description, :string
    field :is_default, :boolean, default: false
    field :public, :boolean, default: true

    belongs_to :team, Stitch.Team
    has_many :group_users, GroupUser, on_replace: :delete
    has_many :users, through: [:group_users, :user]
    has_many :messages, Stitch.Message

    timestamps()
  end

  def changeset(%Stitch.Group{} = struct, params) do
    struct
    |> cast(params, [:name, :slug, :description, :public, :team_id, :creator_user_id])
    |> slugify_name() # This will generate slug from name if slug is missing
    |> validate_required([:name, :slug, :public, :team_id])
    |> validate_length(:name, max: 25)
    |> validate_format(:name, ~r/^[\w-\s]+$/)
    |> unique_constraint(:slug, name: :groups_slug_team_id_unique_index, message: "has already been taken")
  end

  defp slugify_name(%Ecto.Changeset{changes: %{slug: _}} = changeset), do: changeset
  defp slugify_name(%Ecto.Changeset{changes: %{name: name}} = changeset) when not is_nil(name) do
    slug = Slugger.slugify_downcase(name)
    Ecto.Changeset.put_change(changeset, :slug, slug)
  end
  defp slugify_name(%Ecto.Changeset{} = changeset), do: changeset

  defp with_users_changeset(%Stitch.Group{} = struct, params) do
    struct
    |> changeset(params)
    |> cast_assoc(:group_users)
  end

  defp update_users_changeset(%Stitch.Group{} = struct, params) do
    struct
    |> change(params)
    |> cast_assoc(:group_users)
  end

  @doc """
  Creates a new group.
  """
  @spec create(User.t, map, nil | number) :: {:ok, Group.t} | {:error, Ecto.Changeset.t}
  def create(%User{id: user_id, team_id: team_id}, params, member_count \\ nil) do
    with params = add_users(params, team_id, user_id, !!member_count),
         true <- valid_user_ids(params, member_count),
         group = %Group{team_id: team_id, creator_user_id: user_id},
         changeset = with_users_changeset(group, params),
         {:ok, group} <- Repo.insert(changeset) do
      {:ok, Repo.preload(group, :users)}
    else
      false -> {:error, :invalid_user_ids}
      {:error, %Ecto.Changeset{}} = error -> error
    end
  end

  # Ensure users are part of team and format them for `cast_assoc`
  defp add_users(%{"user_ids" => user_ids} = attrs, team_id, creator_id, false) do
    query = base_non_guest_group_user_query(user_ids, team_id, creator_id)
    do_add_users(query, attrs)
  end
  defp add_users(%{"user_ids" => user_ids} = attrs, team_id, creator_id, true) do
    query = base_group_user_query(user_ids, team_id, creator_id)
    do_add_users(query, attrs)
  end
  # Ensure list is populated
  defp add_users(attrs, team_id, creator_id, direct_message?) do
    new_attrs = Map.put(attrs, "user_ids", [])
    add_users(new_attrs, team_id, creator_id, direct_message?)
  end

  defp do_add_users(query, attrs) do
    group_users = Repo.all(query)
    Map.put(attrs, "group_users", group_users)
  end

  defp base_non_guest_group_user_query(user_ids, team_id, creator_id) do
    from u in base_non_guest_users_query(user_ids, team_id, creator_id),
    select: %{id: u.id, user_id: u.id}
  end

  defp base_group_user_query(user_ids, team_id, creator_id) do
    from u in base_users_query(user_ids, team_id, creator_id),
      select: %{id: u.id, user_id: u.id}
  end

  defp base_non_guest_users_query(user_ids, team_id, creator_id) do
    from u in base_users_query(user_ids, team_id, creator_id),
      where: not fragment("? && ?", ^@guest_roles, u.roles)
  end

  defp base_users_query(user_ids, team_id, creator_id) do
    user_ids = [creator_id | user_ids]

    from u in User,
      where: u.team_id == ^team_id,
      where: u.id in ^user_ids,
      where: u.disabled == false,
      distinct: u.id
  end

  defp valid_user_ids(params, expected_count) when is_number(expected_count) do
    length(params["group_users"]) == expected_count
  end

  defp valid_user_ids(_, _), do: true

  @doc """
  Creates a user-to-user direct message.
  The amount of users must be exactly 2.
  For guest users initiating a DM, all users must belong to at least one
  of the guest's restricted rooms.
  """
  def create_single_dm(%User{}, user_ids) when length(user_ids) != 2 do
    {:error, :user_id_count_is_not_2}
  end

  def create_single_dm(%User{id: creator_id}, [user_id_1, user_id_2])
      when creator_id != user_id_1 and creator_id != user_id_2 do
    {:error, :creator_id_is_not_in_user_ids}
  end

  # Handle self-DM
  def create_single_dm(%User{id: id} = creator, [id, id] = user_ids) do
    dm_params = single_dm_params(user_ids)
    create(creator, dm_params, 1)
  end
  def create_single_dm(%User{} = creator, user_ids) do
    dm_params = single_dm_params(user_ids)
    create(creator, dm_params, 2)
  end

  defp single_dm_params(user_ids) do
    %{
      "name" => "__dm_group__",
      "slug" => "__dm:#{user_ids |> Enum.sort |> Enum.join(".")}",
      "user_ids" => user_ids,
      "public" => false
    }
  end

  @doc """
  Creates a multi-user direct message.
  The amount of users must be 3 or more.
  For guest users initiating a DM, all users must belong to at least one
  of the guest's restricted rooms.
  """
  def create_multi_dm(%User{}, user_ids) when length(user_ids) < 3 do
    {:error, :user_id_count_is_not_3_or_more}
  end

  def create_multi_dm(%User{id: creator_id} = creator, user_ids)
    when is_list(user_ids) do
    if creator_id in user_ids do
      dm_params = multi_dm_params(user_ids)
      create(creator, dm_params, length(user_ids))
    else
      {:error, :creator_id_is_not_in_user_ids}
    end
  end

  defp multi_dm_params(user_ids) do
    %{
      "name" => "__multi_dm_group__",
      "slug" => "__dm:#{user_ids |> Enum.sort |> Enum.join(".")}",
      "user_ids" => user_ids,
      "public" => false
    }
  end

  @doc """
  Rename the group with the provided name.
  """
  def rename(%Group{name: old_name}, _new_name) when old_name in @dm_groups do
    {:error, "Direct messages can't be renamed"}
  end

  def rename(%Group{} = group, new_name) when byte_size(new_name) > 0 do
    new_slug = Slugger.slugify_downcase(new_name)
    changeset = Group.changeset(group, %{name: new_name, slug: new_slug})

    case Repo.update(changeset) do
      {:ok, group} ->
        group = Repo.preload(group, :users)
        {:ok, group}
      {:error, _changeset} ->
        {:error, "Name has to be unique"}
    end
  end
  def rename(_, _), do: {:error, "Name cannot be blank or nil"}

  @doc """
  Assigns creator for the default group
  """
  def assign_creator(%Group{is_default: true, creator_user_id: nil} = group, user_id) do
    group
    |> Ecto.Changeset.change(creator_user_id: user_id)
    |> Repo.update
  end

  @doc """
  Add user to the group.
  """
  @spec add_user(Group.t, User.t | pos_integer) :: {:ok, GroupUser.t} | {:error, String.t}
  def add_user(%Group{name: name}, _) when name in @dm_groups do
    {:error, "Users can't join existing direct messages"}
  end
  def add_user(%Group{} = group, %User{id: user_id}) do
    add_user(group, user_id)
  end
  def add_user(%Group{} = group, user_id) do
    params = %{group_id: group.id, user_id: user_id}
    changeset = GroupUser.changeset(%GroupUser{}, params)

    case Repo.insert(changeset) do
      {:error, %Ecto.Changeset{errors: [user_id: {message, _}]}} -> {:error, message}
      any -> any
    end
  end

  @doc """
  Removes a user from the group
  """
  @spec remove_user(Group.t, User.t | pos_integer) :: :ok | {:error, :not_member | :direct_message | :default_group}
  def remove_user(%Group{name: name}, _) when name in @dm_groups do
    {:error, :direct_message}
  end
  def remove_user(%Group{} = group, user_id) when is_integer(user_id) do
    user = Stitch.Accounts.get_by_id(user_id)
    remove_user(group, user)
  end
  def remove_user(%Group{is_default: true}, %User{roles: [role]})
    when role in ["admin", "member"] do
    {:error, :default_group}
  end
  def remove_user(%Group{id: group_id}, %User{id: user_id}) do
    query =
      from gu in GroupUser,
      where: gu.group_id == ^group_id,
      where: gu.user_id == ^user_id

    case Repo.delete_all(query, []) do
      {1, _} -> :ok
      _ -> {:error, :not_member}
      end
    end

  @doc """
  Toggles favorite setting for the user for the specified
  group.
  """
  def toggle_favorite(group_id, user_id) do
    result =
      from(gu in GroupUser,
      where: gu.group_id == ^group_id and gu.user_id == ^user_id,
      update: [set: [is_favorite: not gu.is_favorite]])
    |> Repo.update_all([], returning: true)

    case result do
      {0, []} -> {:error, "User has to be member of room to favorite it."}
      {1, [group_user]} -> {:ok, group_user}
    end
  end

  @doc """
  Toggles public setting for the user for the specified group.
  """
  @spec toggle_public(map, any) :: {:ok, map} | {:error, :direct_message | :default_group | Ecto.Changeset.t}
  def toggle_public(%Group{name: name}, _public) when name in @dm_groups do
    {:error, :direct_message}
  end
  def toggle_public(%Group{is_default: true}, _public) do
    {:error, :default_group}
  end
  def toggle_public(%Group{} = group, public) do
    group
    |> Group.changeset(%{public: public})
    |> Repo.update()
  end

  def hide(%Group{name: name}, _user_id) when name not in @dm_groups do
    {:error, "Only direct messages can be hidden"}
  end

  def hide(%Group{} = group, user_id) do
    case Repo.get_by(GroupUser, group_id: group.id, user_id: user_id) do
      nil ->
        {:error, "User is not part of this room"}
      group_user ->
        group_user =
          group_user
          |> change(%{is_hidden: true})
          |> Repo.update

        Message.mark_as_read(user_id, group.id)

        group_user
    end
  end

  def unhide(%Group{name: name}, _user_id) when name not in @dm_groups do
    {:error, "Only direct messages can be hidden"}
  end

  def unhide(%Group{} = group, user_id) do
    case Repo.get_by(GroupUser, group_id: group.id, user_id: user_id) do
      nil ->
        {:error, "User is not part of this room"}
      group_user ->
        group_user
        |> change(%{is_hidden: false})
        |> Repo.update
    end
  end

  @doc """
  Updates a group's user membership.
  Guests are excluded from being added or removed.
  """
  @spec update_users(Group.t, [user_id :: pos_integer]) :: {:ok, membership_changes} | {:error, Ecto.Changeset.t}
  def update_users(%Group{name: name}, _) when name in @dm_groups do
    {:error, "Can't update members in a direct message room"}
  end

  def update_users(%Group{creator_user_id: creator_id, team_id: team_id} = group, user_ids) do
    group = Repo.preload(group, [group_users: :user])
    current_members = group.group_users

    query = base_non_guest_users_query(user_ids, team_id, creator_id)
    target_users = Repo.all(query)

    {removed_users, added_users, final_group_memberships} =
      current_members
      |> Enum.reduce({[], target_users, []}, &do_calculate_membership_diff/2)
      |> do_add_new_group_user_attrs()

    with attrs = %{group_users: final_group_memberships},
         changeset = update_users_changeset(group, attrs),
         {:ok, _} <- Repo.update(changeset) do
      {:ok, {removed_users, added_users}}
    else
      any -> any
    end
  end

  defp do_calculate_membership_diff(%{user: %{roles: [role]}} = group_user, {remove, add, target})
    when role in @guest_roles do
    {remove, add, [group_user | target]}
  end
  defp do_calculate_membership_diff(group_user, {remove, add, target}) do
    if Enum.find(add, &(&1.id == group_user.user_id))do
      new_add = Enum.reject(add, &(&1.id == group_user.user_id))
      {remove, new_add, [group_user | target]}
    else
      {[group_user.user | remove], add, target}
    end
  end

  defp do_add_new_group_user_attrs({remove, add, existing_group_users}) do
    new_group_users = for %{id: add_id} <- add, do: %{user_id: add_id}
    {remove, add, existing_group_users ++ new_group_users}
  end

  @doc """
  Returns if the given group is a DM group.
  """
  @spec direct_message?(Group.t) :: boolean
  def direct_message?(%Group{name: name}) when name in @dm_groups, do: true
  def direct_message?(%Group{}), do: false
end
