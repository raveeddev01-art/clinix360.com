defmodule StitchConnect.Web.UserControllerTest do
  use StitchConnect.Web.ConnCase, async: true
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
end
