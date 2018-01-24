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
      |> with_team_subdomain(team)
      |> with_api_user(admin)
      |> put(Routes.api_v1_user_path(conn, :promote_admin, user))
      |> json_response(200)

    assert json["id"] == user.id
    assert json["roles"] == ["admin"]
    assert Repo.get(User, user.id).roles == ["admin"]
  end

  describe "GET /api/v1/users" do
    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      {:ok, conn: conn, team: team, user: user}
    end

    test "lists users", %{conn: conn, user: user} do
      conn = get(conn, Routes.api_v1_user_path(conn, :index))
      assert response = json_response(conn, 200)
      assert length(response) == 1
      assert hd(response)["id"] == user.id
    end
  end

  describe "GET /api/v1/users/:id" do
    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      {:ok, conn: conn, team: team, user: user}
    end

    test "returns a user belonging to the team", %{conn: conn, team: team} do
      other_user = insert(:user, team: team)

      conn = get(conn, Routes.api_v1_user_path(conn, :show, other_user))
      assert json = json_response(conn, 200)
      assert json["id"] == other_user.id
    end

    test "gives error for a bad id", %{conn: conn} do
      conn = get(conn, Routes.api_v1_user_path(conn, :show, -1))
      assert json = json_response(conn, :not_found)
      assert json["message"] == "No user found with ID: -1"
    end

    test "doesn't disclose user info to the users from other teams", %{conn: conn} do
      other_team_user = insert(:user)

      conn = get(conn, Routes.api_v1_user_path(conn, :show, other_team_user))
      assert json = json_response(conn, :not_found)
      assert json["message"] == "No user found with ID: #{other_team_user.id}"
    end

    test "restricts guests to only retrieving guests in their rooms", %{conn: conn, team: team, user: user} do
      group = insert(:group, team: team)
      insert(:group_user, group: group, user: user)
      other_user = insert(:user, team: team)

      for role <- ["single-room-guest", "multi-room-guest"] do
        guest = insert(:user, team: team, roles: [role], groups_as_guest: [group.id])
        insert(:group_user, group: group, user: guest)

        base_conn = with_api_user(conn, guest)

        conn = get(base_conn, Routes.api_v1_user_path(base_conn, :show, user))
        assert response = json_response(conn, 200)
        assert response["id"] == user.id

        conn = get(base_conn, Routes.api_v1_user_path(base_conn, :show, other_user))
        assert response = json_response(conn, :not_found)
        assert response["message"] == "No user found with ID: #{other_user.id}"
      end
    end
  end

  describe "POST /api/v1/users/search" do
    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      {:ok, conn: conn, team: team, user: user}
    end

    test "returns users matching search term", %{conn: conn, team: team} do
      other_user = insert(:user, team: team, first_name: "TEST")

      conn = post(conn, Routes.api_v1_user_path(conn, :search), %{"term" => "TEST"})
      assert response = json_response(conn, 200)
      assert length(response) == 1
      assert hd(response)["id"] == other_user.id
    end

    test "restricts guest from only searching users in their groups", %{conn: conn, team: team} do
      user = insert(:user, team: team, first_name: "TEST")
      insert(:user, team: team, first_name: "TEST")
      group = insert(:group, team: team)
      insert(:group_user, group: group, user: user)

      for role <- ["single-room-guest", "multi-room-guest"] do
        guest = insert(:user, team: team, roles: [role], groups_as_guest: [group.id])
        insert(:group_user, group: group, user: guest)

        conn =
          conn
          |> with_api_user(guest)
          |> post(Routes.api_v1_user_path(conn, :search), %{"term" => "TEST"})

        assert response = json_response(conn, 200)
        assert length(response) == 1
        assert hd(response)["id"] == user.id
      end
    end
  end

  describe "PUT /api/v1/users/:id/revoke-admin" do
    test "revokes admin role from existing user", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team, roles: ["admin"])
      admin = insert(:user, team: team, roles: ["admin"])

      json =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(admin)
        |> put(Routes.api_v1_user_path(conn, :revoke_admin, user))
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
        |> with_team_subdomain(team)
        |> with_api_user(admin)
        |> put(Routes.api_v1_user_path(conn, :revoke_admin, admin))
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

  describe "PUT /api/v1/users/:id/change-role" do
    setup %{conn: conn} do
      subscription = insert(:subscription, tier: "PREMIUM")
      team = subscription.team
      default_group = insert(:group, team: team, is_default: true)
      admin = insert(:user, team: team, roles: ["admin"])

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(admin)

      {:ok, conn: conn, team: team, default_group: default_group}
    end

    test "ensures a user is in the default group when `member` role is applied", %{conn: conn, team: team, default_group: default_group} do
      user = insert(:user, team: team)
      refute Stitch.GroupQueries.user_is_member?(default_group.id, user.id)

      conn = put(conn, Routes.api_v1_user_path(conn, :change_role, user), %{"role" => "member"})
      assert json_response(conn, 200)
      assert Stitch.GroupQueries.user_is_member?(default_group.id, user.id)
      updated_user = Repo.get(User, user.id)
      assert updated_user.roles == ["member"]
      assert updated_user.groups_as_guest == []
    end

    test "converts a guest to a member", %{conn: conn, team: team, default_group: default_group} do
      group = insert(:group, team: team, is_default: false)
      for role <- ["single-room-guest", "multi-room-guest"] do
        guest = insert(:user, team: team, roles: [role], groups_as_guest: [group.id])
        insert(:group_user, group: group, user: guest)
        refute Stitch.GroupQueries.user_is_member?(default_group.id, guest.id)

        conn = put(conn, Routes.api_v1_user_path(conn, :change_role, guest), %{"role" => "member"})
        assert json_response(conn, 200)
        assert Stitch.GroupQueries.user_is_member?(default_group.id, guest.id)
        assert Stitch.GroupQueries.user_is_member?(group.id, guest.id)
        updated_guest = Repo.get(User, guest.id)
        assert updated_guest.roles == ["member"]
        assert updated_guest.groups_as_guest == []
      end
    end

    test "converts a member to a guest role", %{conn: conn, team: team, default_group: default_group} do
      restricted_group = insert(:group, team: team)
      for role <- ["single-room-guest", "multi-room-guest"] do
        user = insert(:user, team: team, roles: ["member"])
        insert(:group_user, group: default_group, user: user)

        params = %{
          "role" => role,
          "group_ids" => [restricted_group.id]
        }

        conn = put(conn, Routes.api_v1_user_path(conn, :change_role, user), params)
        assert json_response(conn, 200)
        updated_user = Repo.get(User, user.id)
        assert updated_user.roles == [role]
        assert updated_user.groups_as_guest == [restricted_group.id]
        refute Stitch.GroupQueries.user_is_member?(default_group.id, user.id)
        assert Stitch.GroupQueries.user_is_member?(restricted_group.id, user.id)
      end
    end

    test "can modify a guest's group restrictions", %{conn: conn, team: team} do
      restricted_group = insert(:group, team: team)
      new_group = insert(:group, team: team)
      for role <- ["single-room-guest", "multi-room-guest"] do
        guest = insert(:user, team: team, roles: [role], groups_as_guest: [restricted_group.id])
        insert(:group_user, group: restricted_group, user: guest)

        params = %{
          "role" => role,
          "group_ids" => [new_group.id]
        }

        conn = put(conn, Routes.api_v1_user_path(conn, :change_role, guest), params)
        assert json_response(conn, 200)
        updated_user = Repo.get(User, guest.id)
        assert updated_user.roles == [role]
        assert updated_user.groups_as_guest == [new_group.id]
        assert Stitch.GroupQueries.user_is_member?(new_group.id, guest.id)
        refute Stitch.GroupQueries.user_is_member?(restricted_group.id, guest.id)
      end
    end

    test "gives error when using invalid group ids for guests", %{conn: conn, team: team} do
      user = insert(:user, team: team)

      for role <- ["single-room-guest", "multi-room-guest"] do
        params = %{
          "role" => role,
          "group_ids" => [-1]
        }
        conn = put(conn, Routes.api_v1_user_path(conn, :change_role, user), params)
        assert response = json_response(conn, :unprocessable_entity)
        assert response["message"] =~ "group ids is invalid"
      end
    end

    test "changing to single-room-guest requires exactly 1 group id", %{conn: base_conn, team: team} do
      user = insert(:user, team: team)
      group_1 = insert(:group, team: team)
      group_2 = insert(:group, team: team)

      params = %{"role" => "single-room-guest", "group_ids" => []}
      conn = put(base_conn, Routes.api_v1_user_path(base_conn, :change_role, user), params)
      assert response = json_response(conn, :unprocessable_entity)
      assert response["message"] =~ "exactly 1"

      params = %{"role" => "single-room-guest", "group_ids" => [group_1.id, group_2.id]}
      conn = put(base_conn, Routes.api_v1_user_path(base_conn, :change_role, user), params)
      assert response = json_response(conn, :unprocessable_entity)
      assert response["message"] =~ "exactly 1"
    end

    test "changing to multi-room-guest requires at least 1 group id", %{conn: base_conn, team: team} do
      user = insert(:user, team: team)
      group_1 = insert(:group, team: team)
      group_2 = insert(:group, team: team)

      params = %{"role" => "multi-room-guest", "group_ids" => []}
      conn = put(base_conn, Routes.api_v1_user_path(base_conn, :change_role, user), params)
      assert response = json_response(conn, :unprocessable_entity)
      assert response["message"] =~ "at least 1"

      params = %{"role" => "multi-room-guest", "group_ids" => [group_1.id, group_2.id]}
      conn = put(base_conn, Routes.api_v1_user_path(base_conn, :change_role, user), params)
      assert json_response(conn, 200)
    end

    test "requires the admin role to perform", %{conn: conn, team: team} do
      user = insert(:user, team: team)
      conn =
        conn
        |> with_api_user(user)
        |> put(Routes.api_v1_user_path(conn, :change_role, 99), %{})
      assert response = json_response(conn, :unauthorized)
      assert response["message"] =~ "administrator"
    end
  end
end
