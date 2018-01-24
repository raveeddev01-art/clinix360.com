defmodule Stitch.Stripe.Events do
  @moduledoc """
  Handles Stripe webhook events.
  """
  alias Stitch.Billing
  alias Stitch.TeamQueries
  alias Stitch.Billing.{Plan, Notifications}

  # Successful payment
  def handle_event(%{type: "invoice.payment_succeeded"} = event) do
    [subscription] = get_in(event, [:data, "object", "lines", "data"])
    customer_id = get_in(event, [:data, "object", "customer"])
    subscription_id = subscription["id"]

    sub_params = %{
      valid_until: DateTime.from_unix!(subscription["period"]["end"])
    }

    with {:ok, subscription} <-
           Billing.update_subscription(customer_id, subscription_id, sub_params),
         team = TeamQueries.get_by_id(subscription.team_id),
         owner = TeamQueries.get_team_owner(team) do
      Notifications.send_successful_payment(owner, team)
      record_payment_history(team, event)
      :ok
    end
  end

  # Failed payment
  def handle_event(%{type: "invoice.payment_failed"} = event) do
    [subscription] = get_in(event, [:data, "object", "lines", "data"])
    customer_id = get_in(event, [:data, "object", "customer"])
    subscription_id = subscription["id"]
    next_payment_date = get_in(event, [:data, "object", "next_payment_attempt"])

    with {:ok, days_until_retry} <- days_until_retry(next_payment_date),
         subscription <- Billing.get_subscription(customer_id, subscription_id) do
      team = TeamQueries.get_by_id(subscription.team_id)
      owner = TeamQueries.get_team_owner(team)
      plan_name = Plan.display_name(subscription.tier)
      Notifications.send_failed_payment(owner, team, plan_name, days_until_retry)
      :ok
    end
  end

  # Subscription deleted either by customer's choosing or due to failed payments
  def handle_event(%{type: "customer.subscription.deleted"} = event) do
    customer_id = get_in(event, [:data, "object", "customer"])
    subscription_id = get_in(event, [:data, "object", "id"])

    sub_params = %{
      renews: false,
      subscription_id: nil,
      subscription_line_item_id: nil,
      estimated_invoice_amount: 0
    }

    with {:ok, _subscription} <-
           Billing.update_subscription(customer_id, subscription_id, sub_params) do
      :ok
    end
  end

  def handle_event(_), do: :ok

  defp days_until_retry(nil), do: nil

  defp days_until_retry(unix_timestamp) do
    next_attempt = DateTime.from_unix!(unix_timestamp)
    days = Timex.diff(next_attempt, DateTime.utc_now(), :days)

    if days > 0 do
      {:ok, days}
    end
  end

  defp record_payment_history(team, event) do
    [subscription] = get_in(event, [:data, "object", "lines", "data"])
    invoice_id = get_in(event, [:data, "object", "id"])
    period = subscription["period"]
    plan = subscription["plan"]

    IO.inspect(subscription)

    params = %{
      plan: plan["id"],
      team_id: team.id,
      invoice_id: invoice_id,
      amount: plan["amount"] / 10,
      quantity: subscription["quantity"],
      period_end: DateTime.from_unix!(period["end"]),
      period_start: DateTime.from_unix!(period["start"]),
    }

    Billing.create_payment_history(params)
  end
end
