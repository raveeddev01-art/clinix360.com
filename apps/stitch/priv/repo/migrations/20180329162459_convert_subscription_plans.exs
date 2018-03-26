defmodule Stitch.Repo.Migrations.ConvertSubscriptionPlans do
  use Ecto.Migration
  import Ecto.Query

  alias Stitch.Repo
  alias Stitch.Billing.Subscription

  # TODO: there is an issue with the up and down with normal data
  # VERY important to figure this out and test with a variety of data

  def up do
    tier_names = ["TRIAL","BASIC","PREMIUM", "POWER"]
    [trials, basics, premiums, powers] = Enum.map(tier_names, &get_all_in_tier/1)

    convert_subscriptions_to(trials, "FREE")
    convert_subscriptions_to(basics, "STANDARD")
    convert_subscriptions_to(premiums, "PREMIUM")
    convert_subscriptions_to(powers, "PREMIUM")
  end

  def down do
    # this won't be an exact replication of the old data, but it should get you
    # pretty close (you also might have to comment out some validations)
    tier_names = ["FREE","STANDARD","PREMIUM"]
    [frees, standards, premiums] = Enum.map(tier_names, &get_all_in_tier/1)
    convert_subscriptions_to(frees, "TRIAL")
    convert_subscriptions_to(standards, "BASIC")
    convert_subscriptions_to(premiums, "PREMIUM")
  end

  defp get_all_in_tier(tier_name) do
    Subscription |> where(tier: ^tier_name) |> Repo.all()
  end

  defp convert_subscriptions_to(subscriptions, tier) do
    Enum.each(subscriptions, make_convert_subscription_to(tier))
  end

  defp make_convert_subscription_to(tier) do
    &(
      Stitch.Billing.modify_subscription(
        &1,
        %{tier: tier, renewal_frequency: &1.renewal_frequency}
      )
    )
  end
end
