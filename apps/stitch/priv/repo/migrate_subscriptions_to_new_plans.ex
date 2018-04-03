# We can't run this as a migration because it needs to contact
# Stripe to make updates. Instead we'll run it via mix run after
# the initial deploy.

defmodule Stitch.Repo.Scripts.MigrateSubscriptionsToNewPlans do
  # mix run apps/stitch/priv/repo/migrate_subscriptions_to_new_plans.ex
  require Logger
  import Ecto.{Query, Changeset}
  alias Stitch.{Repo, Billing}
  alias Stitch.Billing.Subscription
  alias Stitch.Repo.Scripts.MigrateSubscriptionsToNewPlans.Helper

  def run do
    # plans that should not be changed on Stripe
    custom_plans = "./stripe_migration/v2-custom-pricing.json"
      |> Helper.read_file()
      |> Helper.json_parse()

    tier_names = ["TRIAL","BASIC","PREMIUM", "POWER"]
    [trials, basics, premiums, powers] = Enum.map(tier_names, &get_all_in_tier/1)

    Logger.info "Converting old subscription tiers to new."

    # this isn't a true transaction since it changes things
    # on stripe, but this safety is better than nothing
    Repo.transaction(fn ->
      convert_subscriptions_to(trials, "FREE", custom_plans)
      convert_subscriptions_to(basics, "STANDARD", custom_plans)
      convert_subscriptions_to(premiums, "PREMIUM", custom_plans)
      convert_subscriptions_to(powers, "PREMIUM", custom_plans)
    end)
  end

  defp get_all_in_tier(tier_name) do
    Subscription
    |> where(tier: ^tier_name)
    |> Repo.all()
  end

  defp convert_subscriptions_to(subscriptions, tier, custom_plans) do
    Enum.each(subscriptions, make_convert_subscription_to(tier, custom_plans))
  end

  defp make_convert_subscription_to(tier, custom_plans) do
    fn (sub) ->
      Logger.info "Changing Subscription with ID #{sub.id}"
      make_modification(sub, tier, custom_plans)
    end
  end

  defp make_modification(subscription, tier, custom_plans) do
    case custom_tier_info(subscription, custom_plans) do
      {:ok, new_tier} ->
        update_custom_subscription(subscription, new_tier)

      _ ->
        update_standard_subscription(subscription, tier)
    end
  end

  defp update_custom_subscription(subscription, new_tier) do
    Logger.info "Updating tier on a custom plan, for team #{subscription.team_id}"
    Logger.info "From tier: #{subscription.tier} - To tier: #{new_tier}."

    subscription
      |> change(%{tier: new_tier})
      |> Repo.update()
  end

  defp update_standard_subscription(subscription, new_tier) do
    Logger.info "Updating tier on standard plan, for team #{subscription.team_id}"
    Logger.info "From tier: #{subscription.tier} - To tier: #{new_tier}."

    Billing.modify_subscription(
      subscription,
      %{tier: new_tier, renewal_frequency: subscription.renewal_frequency || "MONTHLY"}
    )
  end

  defp new_tier_from_old(old_tier) do
    %{
      "TRIAL" => "FREE",
      "BASIC" => "STANDARD",
      "PREMIUM" => "PREMIUM",
      "POWER" => "PREMIUM",
    }[old_tier] || "FREE"
  end

  defp custom_tier_info(%Subscription{team_id: team_id}, custom_plans) do
    plan = custom_plans["#{team_id}"]

    if (plan) do
      {:ok, new_tier_from_old(plan["tier"])}
    else
      :not_custom_plan
    end
  end
end

# cribbed from initial Stripe migration
defmodule Stitch.Repo.Scripts.MigrateSubscriptionsToNewPlans.Helper do
  require Logger

  def read_file(filepath) do
    Logger.info("Reading file: #{__DIR__}/#{filepath}")

    case File.read("#{__DIR__}/#{filepath}") do
      {:error, error} ->
        Logger.error("Error reading file #{filepath}")
        raise error

      {:ok, file} ->
        file
    end
  end

  def json_parse(content) do
    case Poison.decode(content) do
      {:error, error} ->
        Logger.error("Error parsing json content #{content}")
        raise error

      {:ok, json} ->
        json
    end
  end
end

Stitch.Repo.Scripts.MigrateSubscriptionsToNewPlans.run()
