defmodule StitchConnect.Web.GroupController do
  use StitchConnect.Web, :controller
  alias StitchConnect.Web.{PageView, PageService}
  alias Stitch.GroupQueries

  def index(conn, %{"slug" => slug}) do
    current_user = get_session(conn, :current_user)

    case GroupQueries.find_by_slug(slug, current_user) do
      {:ok, _} ->
        render(conn, PageView, "index.html", app_params: PageService.app_params(conn))
      {:error, _} -> conn |> redirect(to: "/")
    end
  end
end
