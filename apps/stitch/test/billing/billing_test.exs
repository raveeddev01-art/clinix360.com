defmodule Stitch.Billing.BillingTest do
  use Stitch.DataCase, async: true
  import Stitch.Factory
  alias Stitch.Billing

  test "setup_new_team/1" do
    team = insert(:team)
    result = Billing.setup_new_team(team)
    assert {:ok, subscription} = result
    assert DateTime.compare(subscription.valid_until, DateTime.utc_now())
    assert subscription.tier == "TRIAL"
    refute subscription.renews
  end
end
