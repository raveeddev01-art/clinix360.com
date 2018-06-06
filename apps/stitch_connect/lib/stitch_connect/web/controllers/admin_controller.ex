defmodule StitchConnect.Web.AdminController do
  use Stitch.Web, :controller
  alias Stitch.Web.PageView
  alias StitchConnect.Web.PageService

  def index(conn, _params) do
    render(conn, PageView, "index.html", app_params: PageService.app_params(conn))
  end
end
