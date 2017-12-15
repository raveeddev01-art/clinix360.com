defmodule StitchConnect.Admin.UserControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: Routes

  describe "GET /users" do
    test "lists all users in DB", %{conn: conn} do
      user_1 = insert(:user,
                      first_name: "John",
                      last_name: "Lennon",
                      phone_number: "15613334455",
                      email: "john@company.com",
                      roles: ["admin"])
      user_2 = insert(:user,
                      first_name: "Paul",
                      last_name: "McCartney",
                      phone_number: "15614444455",
                      email: "paul@company.com",
                      roles: ["member"])
      user_3 = insert(:user,
                      first_name: "Mary",
                      last_name: "Smith",
                      phone_number: "15615554455",
                      email: "mary@company.com",
                      roles: ["member"])
      staff_user = insert(:user, is_staff: true)

      conn =
        conn
        |> with_user_session(staff_user)
        |> with_admin_subdomain()
        |> get("/users")

      assert response = html_response(conn, 200)
      for user <- [user_1, user_2, user_3] do
        assert response =~ user.first_name
        assert response =~ user.last_name
        assert response =~ user.phone_number
        assert response =~ user.email
        assert response =~ List.first(user.roles)
      end
    end

    test "lists all users with pagination", %{conn: conn} do
      for i <- 1..6 do
        insert(:user, first_name: "user_#{i}")
      end
      staff_user = insert(:user, is_staff: true)

      conn =
        conn
        |> with_user_session(staff_user)
        |> with_admin_subdomain()
        |> get(Routes.admin_user_path(conn, :index, page: 2, limit: 3))

      assert response = html_response(conn, 200)
      for i <- 1..3 do
        refute response =~ "user_#{i}"
      end
      for i <- 4..6 do
        assert response =~ "user_#{i}"
      end
    end
  end
end
