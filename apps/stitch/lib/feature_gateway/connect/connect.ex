defmodule Stitch.FeatureGateway.Connect do
  alias Stitch.Repo
  alias Stitch.Team
  alias Stitch.FeatureGateway

  def allowed?(:guests, team) do
    team = Repo.preload(team, :subscription)

    if "connect.guests" in FeatureGateway.available_features(team) do
      true
    else
      if team.subscription.tier == "BASIC" do
        {:error, {:insufficient_tier, ["PREMIUM", "POWER"]}}
      else
        {:error, :subscription_expired}
      end
    end
  end

  @doc """
  Add Stitch Connect features that Team has access to given
  their current subscription tier.
  """
  @spec add_team_features(list(binary), Team.t()) :: list(binary)
  def add_team_features(features, team) do
    team = Repo.preload(team, :subscription)

    features
    |> guests(team)
    |> private_rooms(team)
  end

  defp guests(features, team) do
    if team.subscription.tier in ["TRIAL", "PREMIUM", "POWER"] do
      ["connect.guests" | features]
    else
      features
    end
  end

  defp private_rooms(features, team) do
    if team.subscription.tier in ["TRIAL", "BASIC", "PREMIUM", "POWER"] do
      ["connect.private_rooms" | features]
    else
      features
    end
  end
end