defmodule StitchConnect.Web.UserController do
  use StitchConnect.Web, :controller
  alias StitchConnect.Web.{PageView, PageService}
  alias StitchConnect.Web.Api.V1.UserView
  alias Stitch.{Repo, User}

  def index(conn, %{"username" => username}) do
    current_user = get_session(conn, :current_user)

    case Repo.get_by(User, team_id: current_user.team_id, username: username) do
      nil -> conn |> redirect(to: "/")
      user ->
        app_params = conn
        |> PageService.app_params_map
        |> Map.put("dm_user", UserView.user_json(user))
        |> Poison.encode!

        render(conn, PageView,  "index.html", app_params: app_params)
    end
  end
end
