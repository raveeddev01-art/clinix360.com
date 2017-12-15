defmodule StitchConnect.Web.Admin.ImpersonationControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "GET /impersonate/:user_id" do
    setup %{conn: conn} do
      staff_user = insert(:user, is_staff: true)

      conn =
        conn
        |> with_admin_subdomain()
        |> with_user_session(staff_user)

      {:ok, conn: conn, staff_user: staff_user}
    end

    test "impersonates any user", %{conn: conn, staff_user: staff_user} do
      team = insert(:team)
      target_user = insert(:user, team: team)
      conn = get(conn, admin_impersonation_path(conn, :impersonate, target_user))
      assert redirected_to(conn) =~ "#{team.slug}.localhost:4001"
      assert get_session(conn, :impersonator_user_id) == staff_user.id
      assert get_session(conn, :current_user_id) == target_user.id
    end

    test "gives error for a user that doesn't exist", %{conn: conn} do
      conn = get(conn, admin_impersonation_path(conn, :impersonate, 9_999_999))
      assert html_response(conn, 200) =~ "does not exist"
    end

    test "gives error for using an invalid id", %{conn: conn} do
      conn = get(conn, admin_impersonation_path(conn, :impersonate, "a"))
      assert html_response(conn, 200) =~ ~r"invalid user id"i
    end

    test "only allows staff users", %{conn: conn} do
      user = insert(:user, is_staff: false)
      conn =
        conn
        |> with_user_session(user)
        |> get(admin_impersonation_path(conn, :impersonate, 9_999_999))
      assert response(conn, 403) == "Forbidden"
    end
  end

  describe "GET /impersonate/stop" do
    setup %{conn: conn} do
      staff_user = insert(:user, is_staff: true)

      conn =
        conn
        |> with_admin_subdomain()
        |> with_user_session(staff_user)

      {:ok, conn: conn, staff_user: staff_user}
    end

    test "ends an impersonation session", %{conn: conn, staff_user: staff_user} do
      conn =
        conn
        |> put_session(:impersonator_user_id, staff_user.id)
        |> get(admin_impersonation_path(conn, :stop))

      assert redirected_to(conn) =~ "admin.localhost:4001"
      assert get_session(conn, :current_user_id) == staff_user.id
      refute get_session(conn, :impersonator_user_id)
    end

    test "redirects even when there isn't a current impersonation session", %{conn: conn, staff_user: staff_user} do
      conn = get(conn, admin_impersonation_path(conn, :stop))
      assert redirected_to(conn) =~ "admin.localhost:4001"
      assert get_session(conn, :current_user_id) == staff_user.id
      refute get_session(conn, :impersonator_user_id)
    end

    test "only allows staff users", %{conn: conn} do
      user = insert(:user, is_staff: false)
      conn =
        conn
        |> with_user_session(user)
        |> get(admin_impersonation_path(conn, :stop))
      assert response(conn, 403) == "Forbidden"
    end
  end
end
