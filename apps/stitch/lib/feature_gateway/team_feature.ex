defmodule Stitch.TeamFeature do
  use Ecto.Schema
  alias Stitch.Team

  schema "team_features" do
    belongs_to(:team, Team)
    field(:name, :string)

    timestamps()
  end
end
