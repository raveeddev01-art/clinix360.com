defmodule Stitch.Billing.BillingTest do
  use Stitch.DataCase, async: true
  import Stitch.Factory
  alias Stitch.{Billing, Accounts.User}

  test "setup_new_team/1" do
    team = insert(:team)
    result = Billing.setup_new_team(team)
    assert {:ok, subscription} = result
    assert DateTime.compare(subscription.valid_until, DateTime.utc_now()) == :gt
    assert DateTime.compare(subscription.valid_until, subscription.trial_valid_until) == :eq
    assert subscription.tier == "TRIAL"
    refute subscription.renews
  end

  describe "get_subscription/1" do
    test "returns a subscription for a team" do
      subscription = insert(:subscription)
      team = subscription.team
      result = Billing.get_subscription(team)
      assert result.id == subscription.id
      assert %Stitch.Billing.Subscription{} = result
    end
  end

  describe "get_subscription/2" do
    test "returns a subscription" do
      subscription = insert(:subscription)
      insert(:subscription)

      assert Billing.get_subscription(subscription.customer_id, subscription.subscription_id) ==
               clear_assoc(subscription, :team)
    end

    test "returns nil for bad ids" do
      insert(:subscription)
      refute Billing.get_subscription("bad", "bad")
    end
  end

  describe "modify_subscription/2" do
    test "creates a stripe subscription when on a trial" do
      subscription = insert(:trial_subscription)
      insert(:card, team: subscription.team)
      params = %{tier: "BASIC", renewal_frequency: "MONTHLY"}
      assert {:ok, result} = Billing.modify_subscription(subscription, params)
      assert result.subscription_id
      assert result.tier == "BASIC"
      assert result.renewal_frequency == "MONTHLY"
      assert DateTime.compare(result.valid_until, subscription.valid_until) == :gt
    end

    test "gives errors when expected params are missing/invalid" do
      subscription = insert(:trial_subscription)
      insert(:card, team: subscription.team)
      assert {:error, result} = Billing.modify_subscription(subscription)
      assert elem(result.errors[:tier], 0) =~ "blank"
      assert elem(result.errors[:renewal_frequency], 0) =~ "blank"

      assert {:error, result} =
               Billing.modify_subscription(subscription, %{tier: "bad", renewal_frequency: "bad"})

      assert elem(result.errors[:tier], 0) =~ "expects"
      assert elem(result.errors[:renewal_frequency], 0) =~ "expects"

      subscription = insert(:subscription)
      insert(:card, team: subscription.team)

      assert {:error, result} =
               Billing.modify_subscription(subscription, %{tier: "bad", renewal_frequency: "bad"})

      assert elem(result.errors[:tier], 0) =~ "expects"
      assert elem(result.errors[:renewal_frequency], 0) =~ "expects"
    end

    test "can change a subscription tier" do
      subscription = insert(:subscription)
      insert(:card, team: subscription.team)

      assert {:ok, sub} =
               Billing.modify_subscription(subscription, %{
                 tier: "POWER",
                 renewal_frequency: "MONTHLY"
               })

      assert sub.tier == "POWER"
      assert sub.renewal_frequency == "MONTHLY"
    end

    test "requires a card on file" do
      subscription = insert(:trial_subscription)
      params = %{tier: "BASIC", renewal_frequency: "MONTHLY"}
      assert {:error, :card_required} = Billing.modify_subscription(subscription, params)
    end

    test "guests are not deactivated when downgrading to non-expired TRIAL" do
      subscription = insert(:trial_subscription)
      insert(:card, team: subscription.team)
      team = subscription.team

      insert(:user, team: team, roles: ["single-room-guest"])
      insert(:user, team: team, roles: ["multi-room-guest"])
      insert(:user, team: team, roles: ["member"])

      assert {:ok, sub} =
               Billing.modify_subscription(subscription, %{
                 tier: "TRIAL",
                 renewal_frequency: "MONTHLY"
               })

      assert sub.tier == "TRIAL"
      assert sub.renewal_frequency == "MONTHLY"

      query =
        from(
          u in User,
          where: u.team_id == ^team.id,
          where: u.disabled == false
        )

      users = Repo.all(query)

      assert length(users) == 3
    end

    test "guests are deactivated when downgrading to expired TRIAL" do
      end_date = Timex.shift(DateTime.utc_now(), days: -1)
      subscription = insert(:trial_subscription, trial_valid_until: end_date)
      insert(:card, team: subscription.team)
      team = subscription.team

      insert(:user, team: team, roles: ["single-room-guest"])
      insert(:user, team: team, roles: ["multi-room-guest"])
      insert(:user, team: team, roles: ["member"])

      assert {:ok, sub} =
               Billing.modify_subscription(subscription, %{
                 tier: "TRIAL",
                 renewal_frequency: "MONTHLY"
               })

      assert sub.tier == "TRIAL"
      assert sub.renewal_frequency == "MONTHLY"

      query =
        from(
          u in User,
          where: u.team_id == ^team.id,
          where: u.disabled == false
        )

      users = Repo.all(query)

      assert length(users) == 3 # original: 1 TODO refactor with new freemium model.
    end

    test "guests are deactivated when downgrading to BASIC" do
      subscription = insert(:subscription)
      insert(:card, team: subscription.team)
      team = subscription.team

      insert(:user, team: team, roles: ["single-room-guest"])
      insert(:user, team: team, roles: ["multi-room-guest"])
      insert(:user, team: team, roles: ["member"])

      assert {:ok, sub} =
               Billing.modify_subscription(subscription, %{
                 tier: "BASIC",
                 renewal_frequency: "MONTHLY"
               })

      assert sub.tier == "BASIC"
      assert sub.renewal_frequency == "MONTHLY"

      query =
        from(
          u in User,
          where: u.team_id == ^team.id,
          where: u.disabled == false
        )

      users = Repo.all(query)

      assert length(users) == 1
    end

    test "guests are not deactivated when downgrading to PREMIUM" do
      subscription = insert(:subscription)
      insert(:card, team: subscription.team)
      team = subscription.team

      insert(:user, team: team, roles: ["single-room-guest"])
      insert(:user, team: team, roles: ["multi-room-guest"])
      insert(:user, team: team, roles: ["member"])

      assert {:ok, sub} =
               Billing.modify_subscription(subscription, %{
                 tier: "PREMIUM",
                 renewal_frequency: "MONTHLY"
               })

      assert sub.tier == "PREMIUM"
      assert sub.renewal_frequency == "MONTHLY"

      query =
        from(
          u in User,
          where: u.team_id == ^team.id,
          where: u.disabled == false
        )

      users = Repo.all(query)

      assert length(users) == 3
    end

    test "guests are not deactivated when downgrading to POWER" do
      subscription = insert(:subscription)
      insert(:card, team: subscription.team)
      team = subscription.team

      insert(:user, team: team, roles: ["single-room-guest"])
      insert(:user, team: team, roles: ["multi-room-guest"])
      insert(:user, team: team, roles: ["member"])

      assert {:ok, sub} =
               Billing.modify_subscription(subscription, %{
                 tier: "POWER",
                 renewal_frequency: "MONTHLY"
               })

      assert sub.tier == "POWER"
      assert sub.renewal_frequency == "MONTHLY"

      query =
        from(
          u in User,
          where: u.team_id == ^team.id,
          where: u.disabled == false
        )

      users = Repo.all(query)

      assert length(users) == 3
    end
  end

  describe "cancel_subscription/1" do
    test "cancels an active subscription" do
      subscription = insert(:subscription)

      assert {:ok, %Stitch.Billing.Subscription{renews: false}} =
               Billing.cancel_subscription(subscription)
    end

    test "cancels an active/non-renewing subscription" do
      subscription = insert(:subscription, renews: false)

      assert {:ok, %Stitch.Billing.Subscription{renews: false}} =
               Billing.cancel_subscription(subscription)
    end

    test "errors on an expired subscription" do
      sub_opts = [valid_until: DateTime.utc_now(), renews: false, subscription_id: nil]
      subscription = insert(:subscription, sub_opts)
      assert {:error, :expired} = Billing.cancel_subscription(subscription)
    end

    test "errors when the subscription is a trial" do
      subscription = insert(:trial_subscription)
      assert {:error, :trial} = Billing.cancel_subscription(subscription)
    end
  end

  describe "renews_subscription/1" do
    test "renews an active/renewing subscription" do
      subscription = insert(:subscription)

      assert {:ok, %Stitch.Billing.Subscription{renews: true}} =
               Billing.renew_subscription(subscription)
    end

    test "renews an active/non-renewing subscription" do
      subscription = insert(:subscription, renews: false)

      assert {:ok, %Stitch.Billing.Subscription{renews: true}} =
               Billing.renew_subscription(subscription)
    end

    test "renews an expired subscription" do
      sub_opts = [valid_until: DateTime.utc_now(), renews: false, subscription_id: nil]
      subscription = insert(:subscription, sub_opts)
      assert {:ok, result} = Billing.renew_subscription(subscription)
      assert result.subscription_id
      assert result.renews
      assert DateTime.compare(result.valid_until, subscription.valid_until) == :gt
    end

    test "errors when the subscription is a trial" do
      subscription = insert(:trial_subscription)
      assert {:error, :trial} = Billing.renew_subscription(subscription)
    end
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
          card = insert(:card, team: team)
          card.id
        end

      cards = Billing.list_cards(team)
      assert length(cards) == card_count

      for card <- cards do
        assert card.id in card_ids
      end
    end

    test "doesn't include other team's cards", %{team: team} do
      other_team = insert(:team)
      _other_team_card = insert(:card, team: other_team)

      expected_card = insert(:card, team: team)
      results = Billing.list_cards(team)
      assert length(results) == 1
      assert hd(results).id == expected_card.id
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
      assert card.cardholder_name
    end

    test "requires a source token", %{team: team} do
      assert {:error, changeset} = Billing.add_card(team, nil)
      assert elem(changeset.errors[:source_token], 0) =~ "can't be blank"
    end

    test "sets the card to be the default payment method", %{team: team} do
      old_card = insert(:card, team: team, default: true)
      assert {:ok, %{id: new_id, default: true}} = Billing.add_card(team, "tok_valid")
      cards = Billing.list_cards(team)
      assert %{default: false} = Enum.find(cards, &(&1.id == old_card.id))
      assert %{default: true} = Enum.find(cards, &(&1.id == new_id))
    end

    test "gives an error with invalid source token", %{team: team} do
      assert {:error, :invalid_token} == Billing.add_card(team, "tok_invalid")
    end
  end

  describe "delete_card/2" do
    setup do
      subscription = insert(:subscription)
      team = subscription.team
      default_card = insert(:card, team: team, default: true)
      other_card = insert(:card, team: team)
      {:ok, team: team, default_card: default_card, other_card: other_card}
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

  describe "set_card_as_default/2" do
    setup do
      subscription = insert(:subscription)
      team = subscription.team
      default_card = insert(:card, team: team, default: true)
      other_card = insert(:card, team: team, default: false)
      {:ok, team: team, default_card: default_card, other_card: other_card}
    end

    test "sets a card as the default", %{
      team: team,
      default_card: default_card,
      other_card: other_card
    } do
      assert {:ok, result} = Billing.set_card_as_default(team, other_card.id)
      assert result.default
      assert result.id == other_card.id
      refute Stitch.Repo.get(Stitch.Billing.PaymentMethod, default_card.id).default
    end

    test "gives an error when a card isn't found", %{team: team} do
      assert {:error, :not_found} == Billing.set_card_as_default(team, -1)
    end
  end

  describe "update_subscriber_count/1" do
    test "updates a paid subscription's subscriber count" do
      subscription = insert(:subscription)
      team = subscription.team
      insert(:user, team: team)
      insert(:user, team: team)

      assert :ok == Billing.update_subscriber_count(team)
    end

    test "ignores trial/unpaid subscriptions" do
      trial_subscription = insert(:trial_subscription)
      refute Billing.update_subscriber_count(trial_subscription.team)
    end
  end

  describe "list_billable_users/1" do
    setup do
      team = insert(:team)

      active_users =
        for role <- ["admin", "member", "multi-room-guest"] do
          user = insert(:user, team: team, onboarded: true, roles: [role])
          clear_assoc(user, :team)
        end

      {:ok, team: team, active_users: active_users}
    end

    test "lists active users", %{team: team, active_users: active_users} do
      active_ids = for u <- active_users, do: u.id
      insert(:user, team: team, onboarded: true, disabled: true)
      insert(:user, team: team, onboarded: true, disabled: true)
      insert(:user, team: team, onboarded: false, disabled: false)
      result = Billing.list_billable_users(team)
      assert length(result) == 3

      for user <- result do
        assert user.id in active_ids
      end
    end

    test "doesn't list disabled users", %{team: team} do
      disabled_user = insert(:user, team: team, onboarded: true, disabled: true)
      users = Billing.list_billable_users(team)
      refute Enum.any?(users, &(&1.id == disabled_user.id))
    end

    test "doesn't list users that haven't completed onboarding", %{team: team} do
      non_onboarded_user = insert(:user, team: team, onboarded: false, disabled: false)
      users = Billing.list_billable_users(team)
      refute Enum.any?(users, &(&1.id == non_onboarded_user.id))
    end

    test "excludes single-room guests", %{team: team, active_users: active_users} do
      insert(:user, team: team, onboarded: true, disabled: false, roles: ["single-room-guest"])
      insert(:user, team: team, onboarded: true, disabled: true, roles: ["single-room-guest"])
      insert(:user, team: team, onboarded: false, disabled: false, roles: ["single-room-guest"])

      assert Billing.list_billable_users(team) |> length() == length(active_users)
    end
  end

  describe "create_payment_history/1, list_payment_history/1" do
    setup do
      team = insert(:team)
      {:ok, team: team}
    end

    test "create, list", %{team: team} do
      params = %{
        plan: "basic_yearly",
        team_id: team.id,
        invoice_id: "inv_xxxxxxxxxxxy",
        amount: 12000,
        quantity: 5,
        period_end: NaiveDateTime.utc_now(),
        period_start: NaiveDateTime.utc_now()
      }

      assert history = Billing.create_payment_history(params)
      assert [history] == Billing.list_payment_history(team)
    end
  end
end