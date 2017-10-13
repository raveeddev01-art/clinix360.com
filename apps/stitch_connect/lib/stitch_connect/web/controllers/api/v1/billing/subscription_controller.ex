defmodule StitchConnect.Web.Api.V1.Billing.SubscriptionController do
  use StitchConnect.Web, :controller
  alias Stitch.Billing

  def show(conn, _params) do
    team = conn.assigns.team
    subscription = Billing.get_subscription(team)
    render(conn, "show.json", subscription: subscription)
  end
end
