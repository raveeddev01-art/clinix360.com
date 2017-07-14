defmodule StitchConnect.Web.PageController do
  use StitchConnect.Web, :controller

  def index(conn, _params) do
    team_params = Poison.encode!(%{
      "teamName" => conn.private[:team_name],
      "teamId" => conn.private[:team_id],
      "subdomain" => conn.private[:subdomain]
    })
    render conn, "index.html", team_params: team_params
  end
end
