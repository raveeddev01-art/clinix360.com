defmodule StitchConnect.Web.Api.V1.WebhookController do
  use StitchConnect.Web, :controller

  action_fallback(StitchConnect.Web.Api.FallbackController)

  def index(conn, params) do
    IO.puts("Webhook received")
    IO.inspect(params)
    IO.puts("Webhook DONE")
    text(conn, "Webhook received")
  end
end
