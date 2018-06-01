defmodule StitchConnect.Web.HomeController do
  use StitchConnect.Web, :controller

  def index(conn, _params) do
    login_objects = get_session(conn, :login_objects) || %{}
    team_ids = login_objects |> Map.keys()
    teams = Stitch.TeamQueries.get_by_ids(team_ids)

    IO.inspect(teams)

    conn
    |> put_layout("home_layout.html")
    |> render("index.html", teams: teams)
  end
end
