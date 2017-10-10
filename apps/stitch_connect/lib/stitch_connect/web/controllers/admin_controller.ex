defmodule StitchConnect.Web.AdminController do
  use StitchConnect.Web, :controller
  alias StitchConnect.Web.{PageView, PageService}

  def index(conn, _params) do
    render conn, PageView, "index.html", app_params: PageService.app_params(conn)
  end
end
