defmodule Stitch.Stripe.EventsTest do
  use Stitch.DataCase, async: true
  alias Stitch.Stripe.Events
  alias Stitch.Billing

  test "handles the `invoice.payment_succeeded` event" do
    subscription = insert(:subscription)
    team = subscription.team
    insert(:user, team: team, roles: ["admin"])

    expected_datetime =
      DateTime.utc_now()
      |> DateTime.to_unix()
      |> Kernel.+(60 * 24 * 60 * 60)
      |> DateTime.from_unix!()

    event = %{
      type: "invoice.payment_succeeded",
      data: %{
        object: %{
          customer: subscription.customer_id,
          lines: %{
            data: [%{
              id: subscription.subscription_id,
              period: %{
                end: DateTime.to_unix(expected_datetime)
              }
            }]
          }
        }
      }
    }

    assert :ok == Events.handle_event(event)
    assert DateTime.compare(Billing.get_subscription(team).valid_until, expected_datetime) == :eq
  end
end
