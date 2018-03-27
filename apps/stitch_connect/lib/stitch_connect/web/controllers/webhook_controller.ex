defmodule StitchConnect.Web.WebhookController do
  use StitchConnect.Web, :controller

  action_fallback(StitchConnect.Web.Api.FallbackController)

  def drchrono(conn, params) do
    IO.puts("Webhook received")
    IO.inspect(params)
    IO.puts("Webhook DONE")
    json(conn, %{secret_token: "stitch"})
  end

  def drchrono_ping(conn, params) do
    IO.puts("PING received")
    IO.inspect(params)
    IO.puts("Webhook DONE")
    json(conn, %{secret_token: "stitch"})
  end
end
