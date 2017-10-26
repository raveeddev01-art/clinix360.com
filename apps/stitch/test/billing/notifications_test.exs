defmodule Stitch.Billing.NotificationsTest do
  use Stitch.DataCase, async: true
  use Bamboo.Test
  alias Stitch.Billing.Notifications

  test "send_successful_payment/2" do
    team = insert(:team)
    user = insert(:user, team: team, roles: ["admin"])
    assert_delivered_email Notifications.send_successful_payment(user, team)
  end

  test "send_failed_payment/4" do
    subscription = insert(:subscription)
    team = subscription.team
    user = insert(:user, team: team, roles: ["admin"])
    assert_delivered_email Notifications.send_failed_payment(user, team, "Basic", 5)
  end
end
