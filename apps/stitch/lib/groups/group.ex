defmodule Stitch.Group do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{Repo, Group, GroupUser, Message}
  alias Stitch.Accounts.User

  schema "groups" do
    belongs_to :creator, User, foreign_key: :creator_user_id
    # __multi_dm_group__ and __dm_group__ are reversed group names for dm groups
    field :name, :string
    field :slug, :string
    field :description, :string
    field :is_default, :boolean, default: false
    field :public, :boolean, default: true

    belongs_to :team, Stitch.Team
    has_many :group_users, GroupUser
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

          group_users_res = users |> Enum.reduce_while([], fn user, group_users ->
            changeset = GroupUser.changeset(%GroupUser{}, %{group_id: group.id, user_id: user.id})
            case Repo.insert(changeset) do
              {:ok, _} -> {:cont, group_users ++ [user]}
              {:error, _} -> {:halt, :error}
            end
          end)

          case group_users_res do
            :error -> Repo.rollback("Failed to add room members.")
            users -> %{group | users: users}
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

  def create_multi_dm(_, user_ids) when length(user_ids) != 3 do
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
  def rename(%Group{name: old_name}, _new_name)
      when old_name in ["__dm_group__", "__multi_dm_group__"] do
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
  Add user to the group.
  """
  def add_user(%Group{name: name}, _) when name in ["__dm_group__", "__multi_dm_group__"] do
    {:error, "Users can't join existing direct messages"}
  end

  def add_user(%Group{} = group, user_id) do
    params = %{group_id: group.id, user_id: user_id}
    changeset = GroupUser.changeset(%GroupUser{}, params)

    Ecto.Multi.new
    |> Ecto.Multi.insert(:group_user, changeset)
    |> log_system_join_messages(group, user_id)
    |> Repo.transaction
  end

  @doc """
  Removes a user from the group
  """
  def remove(%Group{name: name}, _) when name in ["__dm_group__", "__multi_dm_group__"] do
    {:error, "Users can't leave direct messages"}
  end

  def remove(%Group{id: group_id} = group, user_id) do
    case Repo.get_by(GroupUser, group_id: group_id, user_id: user_id) do
      nil ->
        {:error, "User is not part of this room"}

      group_user ->
        multi =
          Ecto.Multi.new
          |> Ecto.Multi.delete(:group_user, group_user)
          |> log_system_leave_messages(group, user_id)

        case Repo.transaction(multi) do
          {:ok, %{system_message: system_message}} ->
            {:ok, "User has been removed from the room", system_message}
          {:error, _, _, _} ->
            {:error, "Error leaving the room"}
        end
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
  def toggle_public(%Group{name: name}, _public)
      when name in ["__dm_group__", "__multi_dm_group__"] do
    {:error, "Direct messages' privacy setting can't be changed"}
  end

  def toggle_public(%Group{} = group, public) do
    changeset = Group.changeset(group, %{public: public})
    Repo.update changeset
  end

  def hide(%Group{name: name}, _user_id)
      when name not in ["__dm_group__", "__multi_dm_group__"] do
    {:error, "Only direct messages can be hidden"}
  end

  def hide(%Group{} = group, user_id) do
    case Repo.get_by(GroupUser, group_id: group.id, user_id: user_id) do
      nil ->
        {:error, "User is not part of this room"}
      group_user ->
        group_user
        |> change(%{is_hidden: true})
        |> Repo.update
    end
  end

  def unhide(%Group{name: name}, _user_id)
      when name not in ["__dm_group__", "__multi_dm_group__"] do
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
  def log_system_join_messages(multi, %Group{name: name} = group, user_id) when name not in ["__dm_group__", "__multi_dm_group__"] do
    multi
    |> Ecto.Multi.insert(:system_message, Message.join_message_changeset(group, user_id))
  end
  def log_system_join_messages(multi, _group, _user_id), do: multi

  @doc """
  Creates system messages when the user joins a public or private group.
  """
  def log_system_leave_messages(multi, %Group{name: name} = group, user_id) when name not in ["__dm_group__", "__multi_dm_group__"] do
    multi
    |> Ecto.Multi.insert(:system_message, Message.leave_message_changeset(group, user_id))
  end
  def log_system_leave_messages(multi, _group, _user_id), do: multi
end
