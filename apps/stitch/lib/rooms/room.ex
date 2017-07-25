defmodule Stitch.Room do
  use Ecto.Schema
  import Ecto.Changeset

  schema "rooms" do
    field :name, :string
    field :slug, :string
    belongs_to :team, Stitch.Team

    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name, :team_id, :slug])
    |> validate_required([:name, :team_id, :slug])
  end
end