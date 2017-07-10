defmodule StitchConnect.Web.AuthenticationController do
  use StitchConnect.Web, :controller

  def index(conn, _params) do
    render conn, "index.html", subdomain: conn.private[:subdomain]
  end

  def login(conn, _params) do
    login_params = Poison.encode!(%{
      "teamName" => conn.private[:team_name],
      "teamSlug" => conn.private[:team_slug]
    })
    render conn, "login.html", login_params: login_params
  end
end
