defmodule StitchConnect.Web.GroupController.JoinTest do
  use StitchConnect.Web.ConnCase
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "POST /api/v1/groups/:id/join" do
    setup %{conn: conn} do
      team = insert(:team)
      group = insert(:group, team: team)
      bob = insert(:user, team: team, first_name: "Bob", last_name: "Dylan")

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(bob)

      {:ok, conn: conn, team: team, bob: bob, group: group}
    end

    test "returns group_id and user_id", %{conn: conn, group: group, bob: bob} do
      conn = post(conn, api_v1_group_path(conn, :join, group))
      assert response = json_response(conn, 200)
      assert response["group_id"] == group.id
      assert response["user_id"] == bob.id
    end

    test "gives error when already a group member", %{conn: conn, group: group, bob: bob} do
      insert(:group_user, group: group, user: bob)

      conn = post(conn, api_v1_group_path(conn, :join, group))
      assert response = json_response(conn, :unprocessable_entity)
      assert response["message"] =~ "Cannot add user to the room"
    end

    test "gives error when group doesn't exist", %{conn: conn} do
      conn = post(conn, api_v1_group_path(conn, :join, -1))
      assert response = json_response(conn, :not_found)
      assert response["errors"] =~ "does not exist"
    end

    test "restricts guests from joining any group", %{conn: conn, team: team, group: group} do
      for role <- ["single-room-guest", "multi-room-guest"] do
        guest = insert(:user, team: team, roles: [role])
        conn =
          conn
          |> with_api_user(guest)
          |> post(api_v1_group_path(conn, :join, group))
        assert response = json_response(conn, :forbidden)
        assert response["message"] =~ "authorized"
      end
    end
  end
end
