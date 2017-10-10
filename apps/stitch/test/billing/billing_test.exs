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

  describe "add_card/2" do
    setup do
      subscription = insert(:subscription)
      {:ok, subscription: subscription}
    end

    test "adds a card", %{subscription: subscription} do
      assert {:ok, card} = Billing.add_card(subscription.team, "tok_valid")
      assert card.card_id
      assert card.brand
      assert card.exp_month
      assert card.exp_year
      assert card.last_four
    end

    test "sets the first card to be the default payment method", %{subscription: subscription} do
      assert {:ok, %{default: true}} = Billing.add_card(subscription.team, "tok_valid")
      assert {:ok, %{default: false}} = Billing.add_card(subscription.team, "tok_valid")
    end

    test "gives an error with invalid source token", %{subscription: subscription} do
      assert :error == Billing.add_card(subscription.team, "tok_invalid")
    end
  end
end
