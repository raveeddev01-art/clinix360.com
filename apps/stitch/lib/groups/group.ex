defmodule Stitch.Group do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{Repo, Group, GroupUser}
  alias Stitch.Accounts.User

  schema "groups" do
    belongs_to :creator, User, foreign_key: :creator_user_id
    # __multi_dm_group__ and __dm_group__ are reversed group names for dm groups
    field :name, :string
    field :slug, :string
    field :description, :string
    field :public, :boolean, default: true

    belongs_to :team, Stitch.Team
    has_many :group_users, GroupUser
    has_many :users, through: [:group_users, :user]
    has_many :messages, Stitch.Message

    timestamps()
  end

  def changeset(%Stitch.Group{} = struct, params) do
    struct
    |> cast(params, [:name, :slug, :description, :public, :team_id])
    |> validate_required([:name, :slug, :public, :team_id])
    |> unique_constraint(:slug, name: :groups_slug_team_id_unique_index)
  end

  def create(attrs, team_id, user_id) do
    attrs = attrs |> Map.put("team_id", team_id) |> Map.put("creator_user_id", user_id)

    attrs = case {attrs["name"], attrs["slug"]} do
      {nil, _} -> attrs # would error during creation
      {name, nil} ->
        slug = name |> String.downcase |> Slugger.slugify
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
            :error -> Repo.rollback("Failed to add group members.")
            users -> %{group | users: users}
          end

        {:error, changeset} ->
          if changeset.errors == [slug: {"has already been taken", []}] do
            Repo.rollback(:already_exists)
          else
            Repo.rollback("Failed to create group.")
          end
      end
    end
  end

  @doc """
  Rename the group with the provided name.
  """
  def rename(group_id, name) when byte_size(name) > 0 do
    new_slug =
      name
      |> String.downcase
      |> Slugger.slugify
    group = Repo.get(Group, group_id)

    changeset = Group.changeset(group, %{name: name, slug: new_slug})
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
  def invite(group_id, user_id) do
    params = %{group_id: group_id, user_id: user_id}
    changeset = GroupUser.changeset(%GroupUser{}, params)
    Repo.insert changeset
  end

  @doc """
  Removes a user from the group
  """

  def remove(group_id, user_id) do
    case Repo.get_by(GroupUser, group_id: group_id, user_id: user_id) do
      nil ->
        {:error, "User is not part of the this group"}

      group_user ->
        group_user
        |> Repo.delete
        {:ok, "User has been removed from the group"}

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
      {0, []} -> {:error, "User has to be member of group to favorite it."}
      {1, [group_user]} -> {:ok, group_user}
    end
  end

  @doc """
  Toggles public setting for the user for the specified
  group.
  """
  def toggle_public(group_id, public) do
    query =
      from g in Group,
      where: g.id == ^group_id,
      preload: [:users]
    group = Repo.one(query)
    changeset = Group.changeset(group, %{public: public})
    Repo.update changeset
  end
end
