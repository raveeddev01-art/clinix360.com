defmodule StitchConnect.Web.SessionLockControllerTest do
  use StitchConnect.Web.ConnCase, async: true

  test "POST /api/v1/session-lock", %{conn: conn} do
    team = insert(:team)
    user = insert(:user, team: team)

    locked =
      conn
      |> subdomain(team.slug)
      |> post_as_user(user, "/api/v1/session-lock")
      |> get_session(:locked)

    assert locked
  end

  describe "POST /api/v1/session-unlock" do
    test "with correct PIN", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team, pin: "1234")

      locked =
        conn
        |> subdomain(team.slug)
        |> post_as_user(user, "/api/v1/session-lock")
        |> recycle
        |> subdomain(team.slug)
        |> post_as_user(user, "/api/v1/session-unlock", %{pin: "1234"})
        |> get_session(:locked)

      refute locked
    end

    test "with incorrect PIN not matching password", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team, pin: "1234")

      conn =
        conn
        |> subdomain(team.slug)
        |> post_as_user(user, "/api/v1/session-lock")
        |> recycle
        |> subdomain(team.slug)
        |> post_as_user(user, "/api/v1/session-unlock", %{pin: "4321"})


      assert get_session(conn, :locked)
      assert %{
        "message" => "PIN is incorrect"
      } = json_response(conn, 403)
    end

    test "with incorrect PIN matching password", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team, pin: "1234")

      conn =
        conn
        |> subdomain(team.slug)
        |> post_as_user(user, "/api/v1/session-lock")
        |> recycle
        |> subdomain(team.slug)
        |> post_as_user(user, "/api/v1/session-unlock", %{pin: "password"})


      refute get_session(conn, :locked)
    end
  end
end
