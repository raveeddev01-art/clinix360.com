defmodule StitchConnect.Admin.IndexControllerTest do
  use StitchConnect.Web.ConnCase, async: true

  test "staff can access admin tool through 'admin' subdomain", %{conn: conn} do
    staff_user = insert(:user, is_staff: true)

    conn
    |> with_user_session(staff_user)
    |> with_admin_subdomain()
    |> get("/")
    |> response(200)
  end

  test "non-staff cannot access admin tool", %{conn: conn} do
    regular_user = insert(:user, is_staff: false)

    conn
    |> with_user_session(regular_user)
    |> with_admin_subdomain()
    |> get("/")
    |> response(403)
  end

  test "visitor cannot access admin tool", %{conn: conn} do
    conn
    |> with_admin_subdomain()
    |> get("/")
    |> response(401)
  end
end
