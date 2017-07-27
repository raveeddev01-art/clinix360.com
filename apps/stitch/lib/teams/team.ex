defmodule Stitch.Team do
  use Ecto.Schema
  import Ecto.Changeset

  schema "teams" do
    field :name, :string
    field :slug, :string
    field :security_lockout, :boolean, default: false
    field :seconds_to_lockout, :integer
    field :open_invitations_enabled, :boolean, default: false
    has_many :users, Stitch.User
    has_many :rooms, Stitch.Room

    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name, :slug, :security_lockout, :seconds_to_lockout, :open_invitations_enabled])
    |> validate_required([:name, :slug, :security_lockout, :open_invitations_enabled])
    |> validate_number(:seconds_to_lockout, greater_than: 0)
    |> unique_constraint(:slug)
  end
end