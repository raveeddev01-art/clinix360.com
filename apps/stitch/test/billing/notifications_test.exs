defmodule Stitch.Billing.NotificationsTest do
  use Stitch.DataCase, async: true
  use Bamboo.Test
  alias Stitch.Billing.Notifications

  test "send_successful_payment/2" do
    team = insert(:team)
    user = insert(:user, team: team)
    assert_delivered_email Notifications.send_successful_payment(user, team)
  end
end
