defmodule Stitch.FeatureGateway.Connect do
  alias Stitch.Repo
  alias Stitch.Team

  def allowed?(:guests, _team) do
    # team = Repo.preload(team, :subscription)
    #
    # if "connect.guests" in FeatureGateway.available_features(team) do
    #   true
    # else
    #   if team.subscription.tier == "FREE" do
    #     {:error, {:insufficient_tier, ["STANDARD", "PREMIUM"]}}
    #   else
    #     {:error, :subscription_expired}
    #   end
    # end
    #
    # Note: allowing guests on all tiers
    true
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
    # Note: allowing guests on all tiers
    #
    if team.subscription && team.subscription.tier in ["FREE", "STANDARD", "PREMIUM"] do
      ["connect.guests" | features]
    else
      features
    end
  end

  defp private_rooms(features, team) do
    if team.subscription && team.subscription.tier in ["FREE", "STANDARD", "PREMIUM"] do
      ["connect.private_rooms" | features]
    else
      features
    end
  end
end
