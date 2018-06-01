defmodule StitchConnect.Web.HomeController do
  use StitchConnect.Web, :controller

  def index(conn, _params) do
    login_objects = get_session(conn, :login_objects) || %{}
    team_ids = login_objects |> Map.keys()

    teams =
      team_ids
      |> Stitch.TeamQueries.get_by_ids()
      |> Enum.map(fn team ->
        %{
          id: team.id,
          name: team.name,
          slug: team.slug
        }
      end)

    login_params = %{teams: teams} |> Poison.encode!()

    conn
    |> put_layout("home_layout.html")
    |> render("index.html", login_params: login_params)
  end
end
