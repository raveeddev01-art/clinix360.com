defmodule Stitch.FeatureGatewayTest do
  use Stitch.DataCase, async: true
  alias Stitch.FeatureGateway

  defp trial do
    insert(:trial_subscription)
  end

  defp expired_trial do
    expires =
      DateTime.utc_now()
      |> DateTime.to_unix()
      |> Kernel.-(100)
      |> DateTime.from_unix!()

    insert(:trial_subscription, trial_valid_until: expires)
  end

  defp expired do
    insert(:subscription, subscription_id: nil, subscription_line_item_id: nil)
  end

  defp basic do
    insert(:subscription, tier: "BASIC")
  end

  defp premium do
    insert(:subscription, tier: "PREMIUM")
  end

  defp power do
    insert(:subscription, tier: "POWER")
  end

  test "guests" do
    assert {:error, :trial_expired} = FeatureGateway.allowed?(:guests, expired_trial())
    assert {:error, :subscription_expired} = FeatureGateway.allowed?(:guests, expired())
    assert {:error, {:insufficient_tier, _}} = FeatureGateway.allowed?(:guests, basic())
    assert :ok = FeatureGateway.allowed?(:guests, trial())
    assert :ok = FeatureGateway.allowed?(:guests, premium())
    assert :ok = FeatureGateway.allowed?(:guests, power())
  end
end
