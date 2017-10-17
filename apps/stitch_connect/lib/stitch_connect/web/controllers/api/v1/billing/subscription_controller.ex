defmodule StitchConnect.Web.Api.V1.Billing.SubscriptionController do
  use StitchConnect.Web, :controller
  alias Stitch.Billing

  action_fallback StitchConnect.Web.Api.FallbackController

  def show(conn, _params) do
    team = conn.assigns.team
    subscription = Billing.get_subscription(team)
    render(conn, "show.json", subscription: subscription)
  end

  def update(conn, params) do
    team = conn.assigns.team
    subscription = Billing.get_subscription(team)
    with {:ok, subscription} <- Billing.modify_subscription(subscription, params) do
      render(conn, "show.json", subscription: subscription)
    end
  end
end
