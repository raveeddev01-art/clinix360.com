defmodule StitchConnect.Web.Api.V1.Billing.SubscriptionController do
  use Stitch.Web, :controller
  alias StitchConnect.Web.ErrorView
  alias Stitch.Billing

  action_fallback(StitchConnect.Web.Api.FallbackController)

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
    else
      {:error, :card_required} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(ErrorView, :"422", errors: "At least one card on file is required.")

      error ->
        error
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

      {:error, :free} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(ErrorView, :"422", errors: "Cannot cancel a free subscription.")

      error ->
        error
    end
  end

  def renew(conn, _) do
    team = conn.assigns.team
    subscription = Billing.get_subscription(team)

    with {:ok, subscription} <- Billing.renew_subscription(subscription) do
      render(conn, "show.json", subscription: subscription)
    else
      {:error, :free} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(ErrorView, :"422", errors: "Cannot renew a free subscription.")

      error ->
        error
    end
  end
end
