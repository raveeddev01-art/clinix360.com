defmodule Stitch.FeatureGateway do
  @moduledoc """
  Provides information for a Team's access to features within the Stitch
  ecosystem.
  """

  alias Stitch.Repo
  alias Stitch.Team
  alias Stitch.FeatureGateway.Connect
  alias Stitch.FeatureGateway.Engage
  alias Stitch.FeatureGateway.Manage

  @doc """
  Returns available features for a team given it's current
  subscription tier.

  ## Examples

      iex> Stitch.FeatureGateway.available_features(team)
      ["tier.premium", "connect.guests", "engage.patients"]
  """
  def available_features(%Team{} = team) do
    team = Repo.preload(team, :subscription)

    []
    |> add_team_tier(team.subscription)
    |> Connect.add_team_features(team)
    |> Engage.add_team_features(team)
    |> Manage.add_team_features(team)
  end

  defp add_team_tier(features, subscription) do
    ["tier.#{subscription.tier}" | features]
  end
end