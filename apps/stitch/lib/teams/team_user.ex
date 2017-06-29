defmodule Stitch.TeamUser do
  use Ecto.Schema
  import Ecto.Changeset

  schema "team_users" do
    field :role, :string
    belongs_to :user, Stitch.User
    belongs_to :team, Stitch.Team

    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:role, :user_id, :team_id])
    |> validate_required([:role, :user_id, :team_id])
  end
end