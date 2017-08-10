defmodule StitchConnect.Web.GroupController do
  use StitchConnect.Web, :controller
  alias StitchConnect.Web.PageView
  alias StitchConnect.Web.PageService

  def index(conn, %{"slug" => slug}) do
    current_user = get_session(conn, :current_user)
    case Stitch.GroupQueries.find_by_slug(slug, current_user.id) do
      {:ok, group} ->
        render conn, PageView,  "index.html", app_params: PageService.app_params(conn)
      {:error, reason} ->
        conn
        |> halt
        |> Phoenix.Controller.redirect(to: "/")
    end
  end
end