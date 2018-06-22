defmodule Stitch.Web.StripeWebhookController do
  use Stitch.Web, :controller

  @stripe_client Application.get_env(:stitch, :stripe_client)

  def event(conn, %{"id" => event_id}) do
    with {:ok, event} <- @stripe_client.get_event(event_id) do
      Stitch.Stripe.Events.handle_event(event)
      json(conn, %{})
    else
      _ -> json(conn, %{})
    end
  end

  def event(conn, _) do
    json(conn, %{})
  end
end
