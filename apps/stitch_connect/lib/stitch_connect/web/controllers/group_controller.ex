defmodule StitchConnect.Web.GroupController do
  use StitchConnect.Web, :controller
  alias StitchConnect.Web.PageView
  alias StitchConnect.Web.PageService

  def index(conn, %{"slug" => slug}) do
    current_user = get_session(conn, :current_user)

    with {:ok, group} <- Stitch.GroupQueries.find_by_slug(slug, current_user.id),
         true <- Stitch.GroupAuthorization.can_view?(group.id, current_user.id)
    do
      render(conn, PageView,  "index.html", app_params: PageService.app_params(conn))
    else
      _ -> conn |> halt |> Phoenix.Controller.redirect(to: "/")
    end
  end
end