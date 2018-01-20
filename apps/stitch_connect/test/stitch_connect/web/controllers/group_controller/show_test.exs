defmodule StitchConnect.Web.GroupController.ShowTest do
  use StitchConnect.Web.ConnCase
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "GET /api/v1/groups/:id" do
    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      {:ok, conn: conn, team: team, user: user}
    end

    test "gets a group by id", %{conn: base_conn, team: team} do
      group = insert(:group, team: team)
      conn = get(base_conn, api_v1_group_path(base_conn, :show, group))
      assert response = json_response(conn, 200)
      assert response["id"] == group.id

      conn = get(base_conn, api_v1_group_path(base_conn, :show, -1))
      assert json_response(conn, :not_found)
    end

    test "gets a private group by id if user is a member", %{conn: base_conn, team: team, user: user} do
      group1 = insert(:group, team: team, public: false)
      group2 = insert(:group, team: team, public: false)
      insert(:group_user, user: user, group: group1)

      conn = get(base_conn, api_v1_group_path(base_conn, :show, group1))
      assert response = json_response(conn, 200)
      assert response["id"] == group1.id

      conn = get(base_conn, api_v1_group_path(base_conn, :show, group2))
      assert json_response(conn, :not_found)
    end

    test "groups can only fetch their restricted groups", %{conn: base_conn, team: team} do
      group1 = insert(:group, team: team)
      group2 = insert(:group, team: team)
      user = insert(:user, team: team, roles: ["single-room-guest"], groups_as_guest: [group1.id])
      insert(:group_user, user: user, group: group1)

      base_conn = with_api_user(base_conn, user)

      conn = get(base_conn, api_v1_group_path(base_conn, :show, group1))
      assert response = json_response(conn, 200)
      assert response["id"] == group1.id

      conn = get(base_conn, api_v1_group_path(base_conn, :show, group2))
      assert json_response(conn, :not_found)
    end
  end
end
