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
  Add user to the group.
  """
  def invite(group_id, user_id) do
    params = %{group_id: group_id, user_id: user_id}
    changeset = Stitch.GroupUser.changeset(%Stitch.GroupUser{}, params)
    Repo.insert changeset
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