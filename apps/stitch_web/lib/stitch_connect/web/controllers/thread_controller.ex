defmodule StitchConnect.Web.ThreadController do
  use Stitch.Web, :controller
  alias Stitch.Web.PageView
  alias Stitch.Web.PageService
  alias Stitch.GroupQueries

  def index(conn, _params) do
    current_user = conn.assigns.current_user
    render(conn, PageView, "index.html", app_params: PageService.app_params(conn))
    IO.inspect(current_user, label: "threads index")
  end
end
