defmodule StitchConnect.Web.HomeController do
  use StitchConnect.Web, :controller

  def index(conn, _params) do
    conn
    |> put_layout("home_layout.html")
    |> render "index.html"
  end
end
