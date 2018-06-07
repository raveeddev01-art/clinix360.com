defmodule Stitch.FeatureGatewayTest do
  use Stitch.DataCase, async: true
  alias Stitch.FeatureGateway

  describe "Stitch.FeatureGateway.available_features/1" do
    test "returns features for team as list of binaries" do
      team = insert(:team)
      _subscription = insert(:subscription, team: team, tier: "PREMIUM")
      _feature = insert(:team_feature, team: team, name: "some_app")

      features = FeatureGateway.available_features(team)
      assert length(features) == 4
      assert "some_app" in features
    end
  end
end
