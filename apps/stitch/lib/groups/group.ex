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
    |> unique_constraint(:slug, name: :groups_slug_team_id_unique_index)
  end

  defp slugify_name(%Ecto.Changeset{changes: %{slug: _}} = changeset), do: changeset
  defp slugify_name(%Ecto.Changeset{changes: %{name: name}} = changeset) when not is_nil(name) do
    slug = Slugger.slugify_downcase(name)
    Ecto.Changeset.put_change(changeset, :slug, slug)
  end
  defp slugify_name(%Ecto.Changeset{} = changeset), do: changeset

  defp update_group_users_changeset(%Stitch.Group{} = struct, params) do
    struct
    |> change(params)
    |> cast_assoc(:group_users)
  end

  def create(attrs, %User{team_id: team_id, id: user_id}) do
    attrs = attrs |> Map.put("team_id", team_id) |> Map.put("creator_user_id", user_id)

    attrs = case {attrs["name"], attrs["slug"]} do
      {nil, _} -> attrs # would error during creation
      {name, nil} ->
        slug = Slugger.slugify_downcase(name)
        Map.put(attrs, "slug", slug)
      _ -> attrs
    end

    Repo.transaction fn ->
      case Repo.insert(Group.changeset(%Group{}, attrs)) do
        {:ok, group} ->
          user_ids = Map.get(attrs, "user_ids", []) |> List.insert_at(0, user_id) |> Enum.uniq
          users = User |> where([u], u.team_id == ^team_id and u.id in ^user_ids) |> Repo.all

          add_users_result = add_users(group, users)

          case add_users_result do
            :error ->
              Repo.rollback("Failed to add room members.")
            system_messages ->
              if group.name in @dm_groups do
                %{group | users: users}
              else
                group = %{group | users: users}
                %{group: group, system_messages: system_messages}
              end
          end

        {:error, changeset} ->
          if changeset.errors == [slug: {"has already been taken", []}] do
            Repo.rollback({:already_exists, changeset.changes.slug})
          else
            Repo.rollback("Failed to create room.")
          end
      end
    end
  end

  def add_users(%Group{name: name} = group, users) when name in @dm_groups do
    Enum.reduce_while(users, [], fn (user, group_users) ->
      changeset = GroupUser.changeset(%GroupUser{}, %{group_id: group.id, user_id: user.id})
      case Repo.insert(changeset) do
        {:ok, _} -> {:cont, group_users ++ [user]}
        {:error, _} -> {:halt, :error}
      end
    end)
  end

  def add_users(%Group{} = group, users) do
    Enum.reduce_while(users, [], fn user, acc ->
      case Group.add_user(group, user.id) do
        {:ok, %{system_message: system_message}} -> {:cont, [system_message | acc]}
        _ -> {:halt, :error}
      end
    end)
  end

  def create_single_dm(_, user_ids) when length(user_ids) != 2 do
    {:error, :user_id_count_is_not_2}
  end

  def create_single_dm(%{id: creator_id}, [user_id_1, user_id_2])
      when creator_id != user_id_1 and creator_id != user_id_2 do
    {:error, :creator_id_is_not_in_user_ids}
  end

  def create_single_dm(%User{} = creator, user_ids) do
    create(%{
      "name" => "__dm_group__",
      "slug" => "__dm:#{user_ids |> Enum.sort |> Enum.join(".")}",
      "user_ids" => user_ids,
      "public" => false
    }, creator)
  end

  def create_multi_dm(_, user_ids) when length(user_ids) < 3 do
    {:error, :user_id_count_is_not_3_or_more}
  end

  def create_multi_dm(%{id: creator_id}, [user_id_1, user_id_2, user_id_3])
      when creator_id != user_id_1 and creator_id != user_id_2 and creator_id != user_id_3 do
    {:error, :creator_id_is_not_in_user_ids}
  end

  def create_multi_dm(%User{} = creator, user_ids) do
    create(%{
      "name" => "__multi_dm_group__",
      "slug" => "__dm:#{user_ids |> Enum.sort |> Enum.join(".")}",
      "user_ids" => user_ids,
      "public" => false
    }, creator)
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
  Toggles public setting for the user for the specified
  group.
  """
  def toggle_public(%Group{name: name}, _public) when name in @dm_groups do
    {:error, "Direct messages' privacy setting can't be changed"}
  end

  def toggle_public(%Group{is_default: true}, _public) do
    {:error, "Default group's privacy setting can't be changed"}
  end

  def toggle_public(%Group{} = group, public) do
    changeset = Group.changeset(group, %{public: public})
    Repo.update changeset
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
  @spec update_members(Group.t, [user_id :: pos_integer]) :: {:ok, membership_changes} | {:error, Ecto.Changeset.t}
  def update_members(%Group{name: name}, _) when name in @dm_groups do
    {:error, "Can't update members in a direct message room"}
  end

  def update_members(%Group{creator_user_id: creator_user_id, team_id: team_id} = group, user_ids) do
    group = Repo.preload(group, [group_users: :user])
    valid_users_query =
      from u in User,
      where: u.team_id == ^team_id,
      where: u.id in ^[creator_user_id | user_ids],
      where: u.disabled == false,
      where: not fragment("? && ?", ^@guest_roles, u.roles),
      distinct: u.id
    target_users = Repo.all(valid_users_query)
    current_members = group.group_users

    {removed_users, added_users, final_group_memberships} =
      current_members
      |> Enum.reduce({[], target_users, []}, &do_calculate_membership_diff/2)
      |> do_add_new_group_user_attrs()

    attrs = %{group_users: final_group_memberships}
    changeset = update_group_users_changeset(group, attrs)

    with {:ok, _} <- Repo.update(changeset) do
      {:ok, {added_users, removed_users}}
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
