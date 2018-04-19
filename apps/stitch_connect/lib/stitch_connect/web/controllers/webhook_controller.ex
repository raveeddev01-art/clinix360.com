defmodule StitchConnect.Web.WebhookController do
  use StitchConnect.Web, :controller
  alias StitchIntegrations.DrChrono

  action_fallback(StitchConnect.Web.Api.FallbackController)

  def drchrono_get(conn, params) do
    json(conn, %{secret_token: "stitch"})
  end

  def drchrono(conn, params) do
    [event_type] = get_req_header(conn, "x-drchrono-event")
    DrChrono.handle_webhook(event_type, params)
    json(conn, %{secret_token: "stitch"})
  end
end
