defmodule Stitch.TeamFeature do
  @moduledoc """
  Model for team_features table. Used to feature-flag based on team for
  things like beta-testing/early access.
  """

  use Ecto.Schema
  alias Stitch.{Repo, Team}

  schema "team_features" do
    belongs_to(:team, Team)
    field(:name, :string)

    timestamps()
  end

  @doc """
  Returns list of names of availible features.

  ## Examples
      iex> Stitch.TeamFeature.enabled_for_team(team)
      ["engage", "manage"]
  """
  @spec enabled_for_team(Team.t()) :: list(String.t())
  def enabled_for_team(team) do
    team = Repo.preload(team, [:features])
    Enum.map(team.features, & &1.name)
  end
end
