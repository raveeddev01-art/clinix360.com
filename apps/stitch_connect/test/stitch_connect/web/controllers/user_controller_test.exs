defmodule StitchConnect.Web.UserControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: Routes
  alias Stitch.Repo
  alias Stitch.Accounts.User

  test "PUT /api/v1/users/:id/promote-admin", %{conn: conn} do
    team = insert(:team)
    user = insert(:user, team: team)
    admin = insert(:user, team: team, roles: ["admin"])

    json =
      conn
      |> subdomain(team.slug)
      |> put_as_user(admin, "/api/v1/users/#{user.id}/promote-admin")
      |> json_response(200)

    assert json["id"] == user.id
    assert json["roles"] == ["admin"]
    assert Repo.get(User, user.id).roles == ["admin"]
  end

  test "doesn't disclose user info to the users from other teams", %{conn: conn} do
    team = insert(:team)
    team2 = insert(:team)
    user = insert(:user, team: team)
    user2 = insert(:user, team: team2)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(user)
      |> with_api_user(user)

    json =
      conn
      |> get("/api/v1/users/#{user2.id}")
      |> json_response(422)

    assert json["message"] == "No user found with ID: #{user2.id}"
  end

  describe "PUT /api/v1/users/:id/revoke-admin" do
    test "revokes admin role from existing user", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team, roles: ["admin"])
      admin = insert(:user, team: team, roles: ["admin"])

      json =
        conn
        |> subdomain(team.slug)
        |> put_as_user(admin, "/api/v1/users/#{user.id}/revoke-admin")
        |> json_response(200)

      assert json["id"] == user.id
      assert json["roles"] == ["member"]
      assert Repo.get(User, user.id).roles == ["member"]
    end

    test "admin can't revoke admin role from himself", %{conn: conn} do
      team = insert(:team)
      admin = insert(:user, team: team, roles: ["admin"])

      json =
        conn
        |> subdomain(team.slug)
        |> put_as_user(admin, "/api/v1/users/#{admin.id}/revoke-admin")
        |> json_response(422)

      assert %{"message" => "You cannot revoke admin role from your own account."} == json
      assert Repo.get(User, admin.id).roles == ["admin"]
    end
  end

  describe "POST /api/v1/users/:id/activate" do
    setup %{conn: conn} do
      subscription = insert(:subscription)
      team = subscription.team
      admin = insert(:user, team: team, roles: ["admin"])

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(admin)

      {:ok, conn: conn, team: team, admin: admin}
    end

    test "activates a deactivated user", %{conn: conn, team: team} do
      user = insert(:user, team: team, disabled: true)
      conn = post(conn, Routes.api_v1_user_path(conn, :activate, user), %{})
      assert response = json_response(conn, 200)
      assert response["message"] =~ "activated"
    end

    test "activates an already activated user", %{conn: conn, team: team} do
      user = insert(:user, team: team)
      conn = post(conn, Routes.api_v1_user_path(conn, :activate, user), %{})
      assert response = json_response(conn, 200)
      assert response["message"] =~ "activated"
    end

    test "doesn't allow you to activate yourself", %{conn: conn, admin: admin} do
      conn = post(conn, Routes.api_v1_user_path(conn, :activate, admin), %{})
      assert response = json_response(conn, 422)
      assert response["message"] =~ "cannot activate"
    end

    test "requires an admin role", %{conn: conn, team: team, admin: admin} do
      user = insert(:user, team: team)
      conn =
        conn
        |> with_api_user(user)
        |> post(Routes.api_v1_user_path(conn, :activate, admin), %{})

      assert response = json_response(conn, 401)
      assert response["message"] =~ "administrator"
    end
  end

  describe "POST /api/v1/users/:id/deactivate" do
    setup %{conn: conn} do
      subscription = insert(:subscription)
      team = subscription.team
      admin = insert(:user, team: team, roles: ["admin"])

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(admin)

      {:ok, conn: conn, team: team, admin: admin}
    end

    test "deactivates an already deactivated user", %{conn: conn, team: team} do
      user = insert(:user, team: team, disabled: true)
      conn = post(conn, Routes.api_v1_user_path(conn, :deactivate, user), %{})
      assert response = json_response(conn, 200)
      assert response["message"] =~ "deactivated"
    end

    test "deactivates an activated user", %{conn: conn, team: team} do
      user = insert(:user, team: team)
      conn = post(conn, Routes.api_v1_user_path(conn, :deactivate, user), %{})
      assert response = json_response(conn, 200)
      assert response["message"] =~ "deactivated"
    end

    test "doesn't allow you to deactivate yourself", %{conn: conn, admin: admin} do
      conn = post(conn, Routes.api_v1_user_path(conn, :deactivate, admin), %{})
      assert response = json_response(conn, 422)
      assert response["message"] =~ "cannot deactivate"
    end

    test "requires an admin role", %{conn: conn, team: team, admin: admin} do
      user = insert(:user, team: team)
      conn =
        conn
        |> with_api_user(user)
        |> post(Routes.api_v1_user_path(conn, :deactivate, admin), %{})

      assert response = json_response(conn, 401)
      assert response["message"] =~ "administrator"
    end
  end

  describe "GET /api/v1/users/validate-username" do
    test "on the base domain", %{conn: conn} do
      result = fn query ->
        conn
        |> get(api_v1_user_path(conn, :validate_username, query))
        |> json_response(200)
      end

      assert result.(username: "foobar-_0_-")

      refute result.(username: nil)
      refute result.(username: "!")
    end

    test "on a team subdomain", %{conn: conn} do
      team = insert(:team)
      insert(:user, team: team, username: "existing")

      result = fn query ->
        conn
        |> with_team_subdomain(team)
        |> get(Routes.api_v1_user_path(conn, :validate_username, query))
        |> json_response(200)
      end

      assert result.(username: "foobar-_0_-")

      refute result.(username: nil)
      refute result.(username: "!")
      refute result.(username: "existing")
    end

    test "no username param", %{conn: conn} do
      team = insert(:team)

      %{"message" => message} =
        conn
        |> get(api_v1_user_path(conn, :validate_username))
        |> json_response(:bad_request)

      assert message == "Requires a username query."

      %{"message" => message} =
        conn
        |> with_team_subdomain(team)
        |> get(Routes.api_v1_user_path(conn, :validate_username))
        |> json_response(:bad_request)

      assert message == "Requires a username query."
    end
  end
end
