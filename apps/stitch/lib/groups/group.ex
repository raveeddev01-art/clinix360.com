defmodule Stitch.Group do
  use Ecto.Schema
  import Ecto.Changeset

  schema "groups" do
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
end