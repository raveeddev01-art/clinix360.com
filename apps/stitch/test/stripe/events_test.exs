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
        "object" => %{
          "total" => 1200,
          "id" => "inv_afadsfaerasfasef",
          "customer" => subscription.customer_id,
          "lines" => %{
            "data" => [
              %{
                "id" => subscription.subscription_id,
                "period" => %{
                  "start" => DateTime.to_unix(expected_datetime),
                  "end" => DateTime.to_unix(expected_datetime)
                },
                "plan" => %{
                  "id" => "basic_yearly"
                },
                "quantity" => 6
              }
            ]
          }
        }
      }
    }

    assert :ok == Events.handle_event(event)
    assert DateTime.compare(Billing.get_subscription(team).valid_until, expected_datetime) == :eq

    history = Billing.list_payment_history(team)
    assert 1 = length(history)
  end

  describe "handles the `invoice.payment_failed` event" do
    setup do
      subscription = insert(:subscription)
      insert(:user, team: subscription.team, roles: ["admin"])

      event = %{
        type: "invoice.payment_failed",
        data: %{
          "object" => %{
            "customer" => subscription.customer_id,
            "lines" => %{
              "data" => [
                %{
                  "id" => subscription.subscription_id
                }
              ]
            },
            "next_payment_attempt" => ""
          }
        }
      }

      {:ok, event: event}
    end

    test "when it was the last failed payment attempt", %{event: event} do
      future_time =
        DateTime.utc_now()
        |> DateTime.to_unix()
        |> Kernel.+(7 * 24 * 60 * 60)

      event = put_in(event, [:data, "object", "next_payment_attempt"], future_time)
      assert :ok == Events.handle_event(event)
    end

    test "ignores the final failed payment attempt", %{event: event} do
      future_time =
        DateTime.utc_now()
        |> DateTime.to_unix()

      event = put_in(event, [:data, "object", "next_payment_attempt"], future_time)
      refute :ok == Events.handle_event(event)
    end
  end

  test "handles the `customer.subscription.deleted` event" do
    subscription = insert(:subscription)

    event = %{
      type: "customer.subscription.deleted",
      data: %{
        "object" => %{
          "id" => subscription.subscription_id,
          "customer" => subscription.customer_id
        }
      }
    }

    assert :ok == Events.handle_event(event)

    assert %{
             subscription_id: nil,
             subscription_line_item_id: nil,
             estimated_invoice_amount: 0,
             renews: false
           } = Billing.get_subscription(subscription.team)
  end
end