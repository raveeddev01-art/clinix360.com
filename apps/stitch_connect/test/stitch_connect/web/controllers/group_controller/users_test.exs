defmodule StitchConnect.Web.GroupController.UsersTest do
  use StitchConnect.Web.ConnCase
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "GET /api/v1/groups/:id/users" do
    setup %{conn: conn} do
      team = insert(:team)
      bob = insert(:user, team: team, username: "bob")
      joe = insert(:user, team: team, username: "joe")
      admin = insert(:user, team: team, username: "admin", roles: ["admin"])

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(bob)

      {:ok, conn: conn, team: team, bob: bob, joe: joe, admin: admin}
    end

    test "gives error when user isn't a member of a private group", %{conn: conn, team: team} do
      group = insert(:group, team: team, public: false)

      conn = get(conn, api_v1_group_path(conn, :users, group))
      assert response = json_response(conn, :not_found)
      assert response["errors"] =~ "does not exist"
    end

    test "lists users when user isn't a member of a public group", %{conn: conn, team: team, joe: joe} do
      group = insert(:group, team: team, public: true)
      insert(:group_user, group: group, user: joe)

      conn = get(conn, api_v1_group_path(conn, :users, group))
      assert response = json_response(conn, 200)
      assert [%{"username" => "joe"}] = response
    end

    test "lists users when user is a member of a private group", %{conn: conn, team: team, bob: bob} do
      group = insert(:group, team: team, public: false)
      insert(:group_user, group: group, user: bob)

      conn = get(conn, api_v1_group_path(conn, :users, group))
      assert response = json_response(conn, 200)
      assert [%{"username" => "bob"}] = response
    end

    test "lists users when user is admin and isn't a member of a public group", %{conn: conn, team: team, admin: admin} do
      group = insert(:group, team: team, public: true)

      conn =
        conn
        |> with_api_user(admin)
        |> get(api_v1_group_path(conn, :users, group))

      assert response = json_response(conn, 200)
      assert response == []
    end

    test "lists users when user is admin and isn't a member of a private group", %{conn: conn, team: team, admin: admin} do
      group = insert(:group, team: team, public: false)

      conn =
        conn
        |> with_api_user(admin)
        |> get(api_v1_group_path(conn, :users, group))

      assert response = json_response(conn, 404)
      assert response["errors"] =~ "does not exist"
    end

    test "gives error when user is admin and isn't a member of a public group belonging to another team", %{conn: conn, team: team, admin: admin} do
      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(admin)

      group = insert(:group, public: true)

      conn = get(conn, api_v1_group_path(conn, :users, group))
      assert response = json_response(conn, :not_found)
      assert response["errors"] =~ "does not exist"
    end

    test "restricts guests to only their restricted groups", %{conn: base_conn, team: team} do
      restricted_group = insert(:group, team: team)
      other_group = insert(:group, team: team)
      guest = insert(:user, team: team, roles: ["multi-room-guest"], groups_as_guest: [restricted_group.id])
      insert(:group_user, user: guest, group: restricted_group)

      base_conn = with_api_user(base_conn, guest)

      conn = get(base_conn, api_v1_group_path(base_conn, :users, restricted_group))
      assert json_response(conn, 200)
      conn = get(base_conn, api_v1_group_path(base_conn, :users, other_group))
      assert json_response(conn, :not_found)
    end
  end
end
