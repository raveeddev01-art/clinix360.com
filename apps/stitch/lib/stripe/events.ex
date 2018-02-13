defmodule Stitch.Stripe.Events do
  @moduledoc """
  Handles Stripe webhook events.
  """
  alias Stitch.Billing.{Plan, Notifications}
  alias Stitch.{Billing, TeamQueries, AWS.S3}
  alias StitchConnect.Web.Api.V1.Billing.HistoryView

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

  def record_payment_history(team, event) do
    [subscription] = get_in(event, [:data, "object", "lines", "data"])
    charge_id = get_in(event, [:data, "object", "charge"])
    invoice_id = get_in(event, [:data, "object", "id"])
    amount = get_in(event, [:data, "object", "total"])
    period = subscription["period"]
    plan = subscription["plan"]

    card =
      case Stitch.Stripe.Client.get_transaction(charge_id) do
        {:ok, transaction} -> transaction.source
        _ -> %{"id" => nil, "brand" => nil, "last4" => nil}
      end

    params = %{
      plan: plan["id"],
      team_id: team.id,
      card_id: card["id"],
      invoice_id: invoice_id,
      amount: amount / 100,
      card_brand: card["brand"],
      card_last4: card["last4"],
      quantity: subscription["quantity"],
      period_end: DateTime.from_unix!(period["end"]),
      period_start: DateTime.from_unix!(period["start"])
    }

    statement_pdf_url = generate_statement_pdf(team, params)

    params
    |> Map.put(:statement_pdf_url, statement_pdf_url)
    |> Billing.create_payment_history()
  end

  defp generate_statement_pdf(team, history) do
    subscription =
      history.plan
      |> String.split("_")
      |> List.first()
      |> String.upcase()
      |> Plan.display_name()

    params = [
      team_name: team.name,
      amount: history.amount,
      quantity: history.quantity,
      subscription: subscription,
      card_brand: history.card_brand,
      card_last4: history.card_last4,
      today: Timex.format!(history.period_start, "{Mfull} {D}, {YYYY}")
    ]

    unix_time_stamp = DateTime.utc_now() |> DateTime.to_unix()
    filename = "#{team.id}-#{unix_time_stamp}-#{:rand.uniform(1000)}"

    with html = Phoenix.View.render_to_string(HistoryView, "statement.html", params),
         shell_params = ["-d", "480", "-L", "0", "-R", "0", "-T", "0", "-B", "0"],
         {:ok, filename} <- PdfGenerator.generate(html, filename: filename, shell_params: shell_params) do
      try do
        {:ok, %{status_code: 200}} = S3.upload(filename)
      rescue
        _ -> nil
      catch
        :exit, _ -> nil
      end

      S3.fullpath(filename)
    else
      _ -> nil
    end
  end
end
