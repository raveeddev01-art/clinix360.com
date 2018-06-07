defmodule Stitch.FeatureGateway do
  @moduledoc """
  Provides information for a Team's access to features within the Stitch
  ecosystem.
  """

  alias Stitch.{
    Repo,
    Team,
    TeamFeature,
    FeatureGateway.Connect,
    FeatureGateway.Engage,
    FeatureGateway.Manage
  }

  @doc """
  Returns available features for a team given it's current
  subscription tier.

  ## Examples

      iex> Stitch.FeatureGateway.available_features(team)
      ["tier.premium", "connect.guests", "engage.patients"]
  """
  def available_features(%Team{} = team) do
    team = Repo.preload(team, [:subscription, :features])

    TeamFeature.enabled_for_team(team)
    |> Connect.add_team_features(team)
    |> Engage.add_team_features(team)
    |> Manage.add_team_features(team)
    |> add_team_tier(team.subscription)
  end

  @doc """
  Returns bool based on whether feature enabled for team

  ## Examples

      iex> Stitch.FeatureGateway.enabled?(team, "engage.patients")
      true
  """
  def enabled?(%Team{} = team, feature_name) do
    feature_name in available_features(team)
  end

  defp add_team_tier(features, nil) do
    features
  end

  defp add_team_tier(features, subscription) do
    ["tier.#{subscription.tier}" | features]
  end
end
