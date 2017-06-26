defmodule StitchConnect.Web.AuthenticationController do
  use StitchConnect.Web, :controller

  def index(conn, _params) do
    render conn, "index.html", subdomain: conn.private[:subdomain]
  end
end
