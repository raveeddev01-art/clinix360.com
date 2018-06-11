defmodule Stitch.Web.SessionLockControllerTest do
  use Stitch.Web.ConnCase, async: true
  import Stitch.Web.SubdomainRouter.Helpers

  test "POST /api/v1/session-lock", %{conn: conn} do
    team = insert(:team)
    user = insert(:user, team: team)

    locked =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(user)
      |> with_api_user(user)
      |> post(api_v1_session_lock_path(conn, :lock))
      |> get_user_session_lock_status()

    assert locked
  end

  describe "POST /api/v1/session-unlock" do
    test "with correct PIN", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team, pin: "1234")

      locked =
        conn
        |> with_team_subdomain(team)
        |> with_user_session(user)
        |> with_api_user(user)
        |> post(api_v1_session_lock_path(conn, :lock))
        |> recycle
        |> with_team_subdomain(team)
        |> with_user_session(user)
        |> with_api_user(user)
        |> post(api_v1_session_lock_path(conn, :unlock), %{pin: "1234"})
        |> get_user_session_lock_status()

      refute locked
    end

    test "with incorrect PIN", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team, pin: "1234")

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_user_session(user)
        |> with_api_user(user)
        |> post(api_v1_session_lock_path(conn, :lock))
        |> recycle
        |> with_team_subdomain(team)
        |> with_user_session(user)
        |> with_api_user(user)
        |> post(api_v1_session_lock_path(conn, :unlock), %{pin: "4321"})

      assert %{
               "message" => "PIN is incorrect"
             } = json_response(conn, 403)
    end
  end
end
