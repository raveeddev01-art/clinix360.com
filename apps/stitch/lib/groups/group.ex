defmodule Stitch.Group do
  use Ecto.Schema
  import Ecto.Changeset

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

  @doc """
  Add user to the group.
  """
  def invite(group_id, user_id) do
    params = %{group_id: group_id, user_id: user_id}
    changeset = Stitch.GroupUser.changeset(%Stitch.GroupUser{}, params)
    Repo.insert changeset
  end
end