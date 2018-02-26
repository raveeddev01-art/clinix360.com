defmodule Stitch.FeatureGatewayTest do
  use Stitch.DataCase, async: true
  alias Stitch.FeatureGateway

  describe "Stitch.FeatureGateway.available_features/1" do
    test "returns features for team as list of binaries" do
      team = insert(:team)
      subscription = insert(:subscription, team: team, tier: "PREMIUM")

      features = FeatureGateway.available_features(team)
      assert length(features) == 3
    end
  end
end