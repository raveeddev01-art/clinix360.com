defmodule Stitch.Group do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{Repo, Group, GroupUser, Message}
  alias Stitch.Accounts.User

  @type t :: %__MODULE__{}
  @dm_groups ["__dm_group__", "__multi_dm_group__"]

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
    |> validate_required([:name, :slug, :public, :team_id])
    |> validate_length(:name, max: 25)
    |> validate_format(:name, ~r/^[\w-\s]+$/)
    |> unique_constraint(:slug, name: :groups_slug_team_id_unique_index)
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
  @spec add_user(Group.t, User.t | pos_integer) :: {:ok, Ecto.Changeset.t} | {:error, String.t}
  def add_user(%Group{name: name}, _) when name in @dm_groups do
    {:error, "Users can't join existing direct messages"}
  end
  def add_user(%Group{} = group, %User{id: user_id}) do
    add_user(group, user_id)
  end
  def add_user(%Group{} = group, user_id) do
    params = %{group_id: group.id, user_id: user_id}
    changeset = GroupUser.changeset(%GroupUser{}, params)

    result =
      Ecto.Multi.new
      |> Ecto.Multi.insert(:group_user, changeset)
      |> log_system_join_messages(group, user_id)
      |> Repo.transaction

    case result do
      {:error, :group_user, group_user_changeset, _changes_so_far} ->
        %Ecto.Changeset{errors: [user_id: {message, _}]} = group_user_changeset
        {:error, message}

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
  Creates system messages when the user joins a public or private group.
  """
  def log_system_join_messages(multi, %Group{name: name} = group, user_id) when name not in @dm_groups do
    multi
    |> Ecto.Multi.insert(:system_message, Message.join_message_changeset(group, user_id))
  end
  def log_system_join_messages(multi, _group, _user_id), do: multi

  @doc """
  Creates system messages when the user joins a public or private group.
  """
  def log_system_leave_messages(%Group{name: name} = group, user_id) when name not in @dm_groups do
    Repo.insert(Message.leave_message_changeset(group, user_id))
  end
  def log_system_leave_messages(_group, _user_id), do: nil

  def update_members(%Group{name: name}, _) when name in @dm_groups do
    {:error, "Can't update members in a direct message room"}
  end

  def update_members(%Group{id: group_id, creator_user_id: creator_user_id, team_id: team_id} = group, user_ids) do
    user_ids = Enum.filter(user_ids, & !!Stitch.Accounts.get_for_team_id(&1, team_id))

    current_member_ids =
      GroupUser
      |> where(group_id: ^group_id)
      |> select([gu], gu.user_id)
      |> Repo.all

    remove_user_ids = current_member_ids -- [creator_user_id | user_ids]
    add_user_ids = user_ids -- [creator_user_id | current_member_ids]

    Repo.transaction fn ->
      system_messages = []

      system_messages = Enum.reduce(remove_user_ids, system_messages, fn (user_id, acc) ->
        case Group.remove_user(group, user_id) do
          {:ok, _message, system_message} -> [system_message | acc]
          _ -> acc
        end
      end)

      system_messages = Enum.reduce(add_user_ids, system_messages, fn (user_id, acc) ->
        case Group.add_user(group, user_id) do
          {:ok, %{system_message: system_message}} -> [system_message | acc]
          _ -> acc
        end
      end)

      %{removed: remove_user_ids, added: add_user_ids, system_messages: system_messages}
    end
  end

  @doc """
  Returns if the given group is a DM group.
  """
  @spec direct_message?(Group.t) :: boolean
  def direct_message?(%Group{name: name}) when name in @dm_groups, do: true
  def direct_message?(%Group{}), do: false
end
