defmodule StitchConnect.Web.AuthenticationTest do
  use StitchConnect.Web.ConnCase, async: true
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: Routes
  alias Stitch.{FindYourTeam}

  describe "GET /login" do
    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      _group = insert(:group, team: team, slug: "default_room", is_default: true)

      {:ok, conn: conn, team: team, user: user}
    end

    test "user is already logged in", %{conn: conn, team: team, user: user} do
      conn =
        conn
        |> with_user_session(user)
        |> with_team_subdomain(team)

      conn = get(conn, Routes.authentication_path(conn, :login))
      assert redirected_to(conn, 302) =~ "/rooms/default_room"
    end

    test "user is not logged in", %{conn: conn, team: team} do
      conn =
        conn
        |> with_team_subdomain(team)

      conn = get(conn, Routes.authentication_path(conn, :login))
      assert html_response(conn, 200)
    end
  end

  describe "GET /find-your-team/:token/login" do
    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      _group = insert(:group, team: team, slug: "default_room", is_default: true)

      {:ok, conn: conn, team: team, user: user}
    end

    test "logs the user in", %{conn: conn, user: user, team: team} do
      token = FindYourTeam.create_or_get_token!(user.email)

      teams =
        conn
        |> delete(api_v1_find_your_team_path(conn, :delete, token.token))
        |> json_response(200)

      %{"teams" => [%{"login_token" => login_token}]} = teams

      conn =
        conn
        |> with_team_subdomain(team)
        |> get(Routes.authentication_path(conn, :auto_login, login_token))

      assert redirected_to(conn, 302) =~ "/rooms/default_room"
    end

    test "auto-login token is incorrect", %{conn: conn, user: user, team: team} do
      token = FindYourTeam.create_or_get_token!(user.email)

      teams =
        conn
        |> delete(api_v1_find_your_team_path(conn, :delete, token.token))
        |> json_response(200)

      %{"teams" => [%{"login_token" => _login_token}]} = teams

      conn =
        conn
        |> with_team_subdomain(team)
        |> get(Routes.authentication_path(conn, :auto_login, "incorrect-login"))

      assert html_response(conn, 200) =~ "AuthenticationRouter"
    end
  end
end
