defmodule Stitch.Web.PageController do
  use Stitch.Web, :controller

  import Ecto.Query

  alias Stitch.{
    Repo,
    Accounts.User
  }

  alias Stitch.Web.{
    PageService,
    Api.V1.UserView
  }

  def index(conn, _params) do
    render(conn, "index.html", app_params: PageService.app_params(conn))
  end

  def user(conn, %{"username" => username}) do
    current_user = conn.assigns.current_user
    usernames = String.split(username, ",")

    users =
      User
      |> where(team_id: ^current_user.team_id)
      |> where([u], u.username in ^usernames)
      |> Repo.all()

    if length(usernames) == length(users) do
      app_params =
        conn
        |> PageService.app_params_map()
        |> Map.put("dm_users", Enum.map(users, &UserView.user_json/1))
        |> Poison.encode!()

      render(conn, "index.html", app_params: app_params)
    else
      conn |> redirect(to: "/")
    end
  end
end
