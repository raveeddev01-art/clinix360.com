defmodule StitchConnect.Web.Api.V1.Billing.SubscriptionController do
  use StitchConnect.Web, :controller
  alias StitchConnect.Web.ErrorView
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

  def cancel(conn, _) do
    team = conn.assigns.team
    subscription = Billing.get_subscription(team)
    with {:ok, subscription} <- Billing.cancel_subscription(subscription) do
      render(conn, "show.json", subscription: subscription)
    else
      {:error, :expired} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(ErrorView, :"422", errors: "Subscription has already expired.")
      {:error, :trial} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(ErrorView, :"422", errors: "Cannot cancel a trial subscription.")
      error -> error
    end
  end
end
