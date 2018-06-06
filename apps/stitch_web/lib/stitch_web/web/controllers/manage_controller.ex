defmodule Stitch.Web.ManageController do
  use Stitch.Web, :controller
  alias Stitch.Web.PageService

  def index(conn, _params) do
    render(conn, "index.html", app_params: PageService.app_params(conn))
  end
end
