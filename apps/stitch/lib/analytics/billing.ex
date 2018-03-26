defmodule Stitch.Analytics.Billing do
  @moduledoc """
  Manage billing and subscriptions analytics.
  """

  @analytics Application.get_env(:stitch, :analytics)

  # === EVENT NAMES ===

  @event_subscription_start "Subscription Started"
  @event_payment_cancelled "Payment Cancelled"
  @event_payment_started "Payment Started"
  @event_payment_modified "Payment Modification"

  @unpaid_tiers ["FREE"]
  @paid_tiers ["STANDARD", "PREMIUM"]

  @doc """
  Logs events for new subscriptions.
  """
  def subscription_create(subscription) do
    Stitch.Task.start fn ->
      do_subscription_create(subscription)
    end
  end

  @doc """
  Logs events for updated subscriptions (free or paid).
  """
  def subscription_update(subscription, original_tier) do
    # This saves specific events to the db, but I'm not sure
    # where we're using them.
    # Keeping it in here, to maintain consistency.
    identify_and_group(subscription.team_id)

    Stitch.Task.start fn ->
      do_subscription_update(subscription, original_tier)
    end
  end

  @doc """
  Logs events for cancelled subscriptions (paid).
  """
  def subscription_cancel(subscription) do
    Stitch.Task.start fn ->
      do_subscription_cancel(subscription)
    end
  end

  # ============
  #   PRIVATE
  # ============

  defp identify_and_group(team_id) do
    Stitch.Task.start fn ->
      @analytics.identify_and_group(%{team_id: team_id})
    end
  end

  # === CREATE ===

  defp do_subscription_create(subscription) do
    properties = billing_event_properties(subscription)
    @analytics.track(@event_subscription_start, properties)
  end

  # === CANCEL ===

  defp do_subscription_cancel(subscription) do
    properties = billing_event_properties(subscription)
    @analytics.track(@event_payment_cancelled, properties)
  end

  # === UPDATE ===

  defp do_subscription_update(subscription, original_tier) do
    event_name = billing_change_event_name(subscription, original_tier)
    additional_props = %{"subscription_original_tier" => original_tier}
    properties = billing_event_properties(subscription) |> Map.merge(additional_props)

    @analytics.track(event_name, properties)
  end

  # === HELPERS ===

  defp billing_event_properties(subscription) do
    team = team_from_subscription(subscription)

    %{
      "team_created_at" => team.inserted_at,
      "team_id"    => Integer.to_string(team.id),
      "team_name"  => team.name,
      "team_slug"  => team.slug,
      "subscription_tier" => subscription.tier,
      "subscription_renewal_frequency" => subscription.renewal_frequency
    }
  end

  defp billing_change_event_name(%{tier: new_tier}, old_tier) do
    now_paid = Enum.member?(@paid_tiers, new_tier)
    was_paid = Enum.member?(@paid_tiers, old_tier)
    started_payment = !was_paid && now_paid
    stopped_payment = was_paid && !now_paid

    # ugly nested if
    if started_payment do
      @event_payment_started
    else
      if stopped_payment do
        @event_payment_cancelled
      else
        @event_payment_modified
      end
    end
  end

  defp team_from_subscription(subscription) do
    Stitch.TeamQueries.get_by_id(subscription.team_id)
  end
end
