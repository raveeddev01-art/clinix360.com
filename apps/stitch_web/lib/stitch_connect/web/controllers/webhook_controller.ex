defmodule StitchConnect.Web.WebhookController do
  use Stitch.Web, :controller

  alias Stitch.{
    Tokbox,
    Drchrono,
    Integration,
    IntegrationQueries
  }

  action_fallback(Stitch.Web.Api.FallbackController)

  def drchrono_get(conn, _params) do
    json(conn, %{secret_token: "stitch"})
  end

  def drchrono(conn, %{"webhook_token" => webhook_token} = params) do
    with {:exists?, %Integration{} = integration} <-
           {:exists?, IntegrationQueries.find_by_webhook_token(webhook_token)} do
      [event_type] = get_req_header(conn, "x-drchrono-event")
      Drchrono.handle_webhook(integration, event_type, params)
      json(conn, %{secret_token: "stitch"})
    else
      _ ->
        json(conn, %{secret_token: "stitch"})
    end
  end

  def tokbox(conn, params) do
    Tokbox.Events.handle_event(params)

    json(conn, %{status: "ok"})
  end
end
