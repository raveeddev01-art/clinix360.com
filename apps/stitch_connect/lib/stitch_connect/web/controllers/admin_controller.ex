defmodule StitchConnect.Web.AdminController do
  use StitchConnect.Web, :controller

  def index(conn, _params) do
    app_params = Poison.encode!(%{
      "teamName" => conn.private[:team_name],
      "teamId" => conn.private[:team_id],
      "subdomain" => conn.private[:subdomain]
    })
    render conn, "index.html", app_params: app_params
  end
end
