defmodule StitchConnect.Web.AuthenticationTest do
  use StitchConnect.Web.ConnCase, async: true
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: Routes

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
end
