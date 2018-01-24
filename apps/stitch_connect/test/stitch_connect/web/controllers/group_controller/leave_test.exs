defmodule StitchConnect.Web.GroupController.LeaveTest do
  use StitchConnect.Web.ConnCase, async: true
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "POST /api/v1/groups/:id/leave" do
    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      default_group = insert(:group, team: team, slug: "general", is_default: true)
      other_group = insert(:group, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      {:ok, conn: conn, team: team, user: user, default_group: default_group, other_group: other_group}
    end

    test "leaves a group when the user is a member", %{conn: conn, user: user, other_group: group} do
      insert(:group_user, group: group, user: user)
      expected_redirect_path = "/rooms/general"

      conn = post(conn, api_v1_group_path(conn, :leave, group))
      assert response = json_response(conn, 200)

      assert response["message"] =~ "User has been removed from the room"
      assert response["redirect_to"] == expected_redirect_path
    end

    test "gives error when leaving a group when user isn't a member", %{conn: conn, other_group: group} do
      conn = post(conn, api_v1_group_path(conn, :leave, group))
      assert response = json_response(conn, :unprocessable_entity)
      assert response["message"] =~ "isn't a member"
    end

    test "gives error when room doesn't exist", %{conn: conn} do
      conn = post(conn, api_v1_group_path(conn, :leave, -1))
      assert response = json_response(conn, :not_found)
      assert response["errors"] =~ "does not exist"
    end

    test "restricts guests from leaving any group", %{conn: conn, team: team, other_group: group} do
      for role <- ["multi-room-guest", "single-room-guest"] do
        guest = insert(:user, team: team, roles: [role], groups_as_guest: [group.id])
        insert(:group_user, group: group, user: guest)
        conn =
          conn
          |> with_api_user(guest)
          |> post(api_v1_group_path(conn, :leave, group))
        assert response = json_response(conn, :forbidden)
        assert response["message"] =~ "authorized"
      end
    end
  end
end
