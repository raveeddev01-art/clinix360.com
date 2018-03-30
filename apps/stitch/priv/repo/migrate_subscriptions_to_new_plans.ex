defmodule Stitch.Repo.Scripts.MigrateSubscriptionsToNewPlans do
  # mix run apps/stitch/priv/repo/migrate_subscriptions_to_new_plans.ex
  require Logger
  import Ecto.Query
  alias Stitch.Repo
  alias Stitch.Billing.Subscription

  def run do
    tier_names = ["TRIAL","BASIC","PREMIUM", "POWER"]
    [trials, basics, premiums, powers] = Enum.map(tier_names, &get_all_in_tier/1)

    Logger.info "Converting old subscription types to new:"

    # this isn't really a transaction since it changes
    # things on stripe, but this safety is better than nothing
    Repo.transaction(fn ->
      convert_subscriptions_to(trials, "FREE")
      convert_subscriptions_to(basics, "STANDARD")
      convert_subscriptions_to(premiums, "PREMIUM")
      convert_subscriptions_to(powers, "PREMIUM")
    end)
  end

  defp get_all_in_tier(tier_name) do
    Subscription |> where(tier: ^tier_name) |> Repo.all()
  end

  defp convert_subscriptions_to(subscriptions, tier) do
    Enum.each(subscriptions, make_convert_subscription_to(tier))
  end

  defp make_convert_subscription_to(tier) do
    fn (sub) ->
      Logger.info "Changing Subscription with ID #{sub.id}"
      Logger.info "From tier: #{sub.tier} - To tier: #{tier}"

      Stitch.Billing.modify_subscription(
        sub,
        %{tier: tier, renewal_frequency: sub.renewal_frequency || "MONTHLY"}
      )
    end
  end
end

Stitch.Repo.Scripts.MigrateSubscriptionsToNewPlans.run()
