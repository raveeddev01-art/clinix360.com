# 500 errors go right to ErrorView (due to Phoenix conventions)

# 404 errors normally would as well, but we manually use
# this controller (see router) so we can use the main layout/frontend

defmodule StitchConnect.Web.ErrorController do
  use StitchConnect.Web, :controller

  def not_found(conn, _params) do
    # reuse home index as frontend router handles not found
    conn
    |> put_layout("home_layout.html")
    |> put_status(404)
    |> render(StitchConnect.Web.HomeView, "index.html")
  end
end
