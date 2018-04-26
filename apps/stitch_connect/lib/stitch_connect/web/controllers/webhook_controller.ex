defmodule StitchConnect.Web.WebhookController do
  use StitchConnect.Web, :controller
  alias Stitch.Drchrono
  alias Stitch.{Integration, IntegrationQueries}

  action_fallback(StitchConnect.Web.Api.FallbackController)

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
end
