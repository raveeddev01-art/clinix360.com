defmodule Stitch.Group do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{Repo, Group}
  alias Stitch.Accounts.User

  schema "groups" do
    belongs_to :creator, Stitch.Accounts.User, foreign_key: :creator_user_id
    field :name, :string
    field :slug, :string
    field :description, :string
    field :public, :boolean, default: true
    belongs_to :team, Stitch.Team
    has_many :group_users, Stitch.GroupUser
    has_many :users, through: [:group_users, :user]

    timestamps()
  end

  def changeset(%Stitch.Group{} = struct, params) do
    struct
    |> cast(params, [:name, :slug, :description, :public, :team_id])
    |> validate_required([:name, :slug, :public, :team_id])
    |> unique_constraint(:slug, name: :groups_slug_team_id_unique_index)
  end

  def create(attrs, user_id) do

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
        {:ok, group}
      {:error, changeset} ->
        {:error, "Name has to be unique"}
    end
  end
  def rename(_, _), do: {:error, "Name cannot be blank or nil"}

  @doc """
  Add user to the group.
  """
  def invite(group_id, user_id) do
    params = %{group_id: group_id, user_id: user_id}
    changeset = Stitch.GroupUser.changeset(%Stitch.GroupUser{}, params)
    Repo.insert changeset
  end

  @doc """
  Removes a user from the group
  """

  def remove(group_id, user_id) do
    case Repo.get_by(Stitch.GroupUser, group_id: group_id, user_id: user_id) do
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
    user = Repo.get(User, user_id)
    case Enum.member?(user.favorite_groups, group_id) do
      true ->
        favorite_groups = List.delete(user.favorite_groups, group_id)
        favorited = false
      false ->
        favorite_groups = [group_id | user.favorite_groups]
        favorited = true
    end
    changeset = User.changeset(user, %{favorite_groups: favorite_groups})
    Repo.update changeset
    favorited
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
