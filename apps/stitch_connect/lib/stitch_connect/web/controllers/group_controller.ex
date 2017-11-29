defmodule StitchConnect.Web.GroupController do
  use StitchConnect.Web, :controller
  alias StitchConnect.Web.{PageView, PageService}
  alias Stitch.GroupQueries

  def index(conn, %{"slug" => slug}) do
    current_user = conn.assigns.current_user

    case GroupQueries.find_by_slug(slug, current_user) do
      {:ok, _} ->
        render(conn, PageView, "index.html", app_params: PageService.app_params(conn))
      {:error, _} ->
        default_group = GroupQueries.default_group(current_user)
        redirect(conn, to: StitchConnect.Web.SubdomainRouter.Helpers.group_path(conn, :index, default_group.slug))
    end
  end
end
