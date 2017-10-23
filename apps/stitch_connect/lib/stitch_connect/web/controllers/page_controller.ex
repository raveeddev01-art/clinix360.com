defmodule StitchConnect.Web.PageController do
  use StitchConnect.Web, :controller
  alias StitchConnect.Web.PageService

  def index(conn, _params) do
    render conn, "index.html", app_params: PageService.app_params(conn)
  end

  def download(conn, _params) do
    render conn, "download.html"
  end
end
