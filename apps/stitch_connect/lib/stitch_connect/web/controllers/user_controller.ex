defmodule StitchConnect.Web.UserController do
  use StitchConnect.Web, :controller
  alias StitchConnect.Web.{PageView, PageService}
  alias StitchConnect.Web.Api.V1.UserView
  alias Stitch.{Repo, Accounts.User}

  import Ecto.Query

  def index(conn, %{"username" => username}) do
    current_user = get_session(conn, :current_user)

    usernames = String.split(username, ",")
    users = User |> where(team_id: ^current_user.team_id)
    |> where([u], u.username in ^usernames) |> Repo.all

    if length(usernames) == length(users) do
      app_params = conn
      |> PageService.app_params_map
      |> Map.put("dm_users", Enum.map(users, &UserView.user_json/1))
      |> Poison.encode!

      render(conn, PageView,  "index.html", app_params: app_params)
    else
      conn |> redirect(to: "/")
    end
  end
end
