defmodule Stitch.Web.Plug.AnalyticsApi do
  use Stitch.Web, :plug

  def init(default), do: default

  def call(conn, _params) do
    params = conn.params

    if params["analytics_token"] == "7vDP3nN6RvOPBawsN8lWvSwDNCcvVGFc" do
      conn
    else
      conn
      |> put_status(:unauthorized)
      |> Phoenix.Controller.json(nil)
      |> halt
    end
  end
end
