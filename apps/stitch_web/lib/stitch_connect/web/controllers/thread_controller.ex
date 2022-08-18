defmodule StitchConnect.Web.ThreadController do
  use Stitch.Web, :controller
  alias Stitch.Web.PageView
  alias Stitch.Web.PageService
  # alias Stitch.GroupQueries

  def index(conn, _params) do
    _current_user = conn.assigns.current_user
    render(conn, PageView, "index.html", app_params: PageService.app_params(conn))
  end
end
