defmodule StitchConnect.Web.HomeController do
  use StitchConnect.Web, :controller
  alias Stitch.{Accounts.User, UserQueries, Team, TeamQueries}

  def index(conn, _params) do
    login_params = get_login_params(conn)

    conn
    |> put_layout("home_layout.html")
    |> render("index.html", login_params: login_params)
  end

  def get_login_params(conn) do
    with {:token, token} when is_binary(token) <-
           {:token, get_session(conn, :current_user_token)},
         {:user, %User{disabled: false} = user} <- {:user, UserQueries.get_by_token(token)},
         {:team, %Team{} = team} <- {:team, TeamQueries.get_by_id(user.team_id)} do
      Poison.encode!(%{team: %{id: team.id, name: team.name, slug: team.slug}})
    else
      _ -> nil
    end
  end
end
