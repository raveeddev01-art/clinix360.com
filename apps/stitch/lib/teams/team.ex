defmodule Stitch.Team do
  use Ecto.Schema
  import Ecto.Changeset

  schema "teams" do
    field :name, :string
    field :slug, :string
    many_to_many :users, Stitch.User, join_through: "team_users"

    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name, :slug])
    |> validate_required([:name])
    |> unique_constraint(:name)
  end
end