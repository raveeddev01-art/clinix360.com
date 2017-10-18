defmodule Stitch.Stripe.Events do
  @moduledoc """
  Handles Stripe webhook events.
  """
  alias Stitch.Billing
  alias Stitch.TeamQueries
  alias Stitch.Billing.Notifications

  # Successful payment
  def handle_event(%{type: "invoice.payment_succeeded"} = event) do
    customer_id = event.data.object.customer
    [subscription] = event.data.object.lines.data

    sub_params = %{
      valid_until: DateTime.from_unix!(subscription.period.end)
    }

    with {:ok, subscription} <- Billing.update_subscription(customer_id, subscription.id, sub_params),
         team = TeamQueries.get_by_id(subscription.team_id),
         owner = TeamQueries.get_team_owner(team) do
      Notifications.send_successful_payment(owner, team)
      :ok
    end
  end
  def handle_event(_), do: :ok
end
