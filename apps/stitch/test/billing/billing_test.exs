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

  describe "list_cards/1" do
    setup do
      subscription = insert(:subscription)
      {:ok, team: subscription.team}
    end

    test "lists all cards for a team", %{team: team} do
      card_count = 5
      card_ids =
        for _ <- 1..card_count do
          {:ok, card} = Billing.add_card(team, "tok_valid")
          card.id
        end

      cards = Billing.list_cards(team)
      assert length(cards) == card_count
      for card <- cards do
        assert card.id in card_ids
      end
    end
  end

  describe "add_card/2" do
    setup do
      subscription = insert(:subscription)
      {:ok, team: subscription.team}
    end

    test "adds a card", %{team: team} do
      assert {:ok, card} = Billing.add_card(team, "tok_valid")
      assert card.card_id
      assert card.brand
      assert card.exp_month
      assert card.exp_year
      assert card.last_four
    end

    test "sets the first card to be the default payment method", %{team: team} do
      assert {:ok, %{default: true}} = Billing.add_card(team, "tok_valid")
      assert {:ok, %{default: false}} = Billing.add_card(team, "tok_valid")
    end

    test "gives an error with invalid source token", %{team: team} do
      assert :error == Billing.add_card(team, "tok_invalid")
    end
  end

  describe "delete_card/2" do
    setup do
      subscription = insert(:subscription)
      {:ok, default_card} = Billing.add_card(subscription.team, "tok_valid")
      {:ok, other_card} = Billing.add_card(subscription.team, "tok_valid")
      {:ok, team: subscription.team, default_card: default_card, other_card: other_card}
    end

    test "gives error when deleting the default card", %{team: team, default_card: card} do
      assert {:error, :default_card} == Billing.delete_card(team, card.id)
    end

    test "deletes a card", %{team: team, other_card: card} do
      assert :ok == Billing.delete_card(team, card.id)
      refute Stitch.Repo.get(Stitch.Billing.PaymentMethod, card.id)
    end

    test "gives error when a card isn't found", %{team: team} do
      assert {:error, :not_found} == Billing.delete_card(team, -1)
    end
  end

  describe "set_as_default/2" do
    setup do
      subscription = insert(:subscription)
      {:ok, default_card} = Billing.add_card(subscription.team, "tok_valid")
      {:ok, other_card} = Billing.add_card(subscription.team, "tok_valid")
      {:ok, team: subscription.team, default_card: default_card, other_card: other_card}
    end

    test "sets a card as the default", %{team: team, default_card: default_card, other_card: other_card} do
      assert {:ok, result} = Billing.set_as_default(team, other_card.id)
      assert result.default
      assert result.id == other_card.id
      refute Stitch.Repo.get(Stitch.Billing.PaymentMethod, default_card.id).default
    end

    test "gives an error when a card isn't found", %{team: team} do
      assert {:error, :not_found} == Billing.set_as_default(team, -1)
    end
  end
end
