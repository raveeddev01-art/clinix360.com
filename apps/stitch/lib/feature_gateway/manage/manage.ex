defmodule Stitch.FeatureGateway.Manage do
  alias Stitch.Repo
  alias Stitch.Team

  @doc """
  Add Stitch Manage features that Team has access to given
  their current subscription tier.
  """
  @spec add_team_features(list(binary), Team.t()) :: list(binary)
  def add_team_features(features, team) do
    team = Repo.preload(team, :subscription)

    features
  end
end