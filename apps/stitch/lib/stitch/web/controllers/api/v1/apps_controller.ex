defmodule Stitch.Web.Api.V1.AppController do
  use Stitch.Web, :controller
  alias Stitch.AppQueries

  action_fallback(StitchConnect.Web.Api.FallbackController)

  def index(conn, _params) do
    apps = AppQueries.catalog()
    render(conn, "index.json", apps: apps)
  end
end
