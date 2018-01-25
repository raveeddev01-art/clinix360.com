defmodule StitchConnect.Web.GroupController.SearchTest do
  use StitchConnect.Web.ConnCase, async: true
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "POST /api/v1/groups/search" do
    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)

      conn =
        conn
        |> with_api_user(user)
        |> with_team_subdomain(team)

      {:ok, conn: conn, team: team, user: user}
    end

    test "returns groups matching criteria", %{conn: conn, team: team} do
      group1 = insert(:group, team: team, name: "Test", public: true)
      group2 = insert(:group, team: team, slug: "Test", public: true)
      insert(:group, team: team)

      conn = post(conn, api_v1_group_path(conn, :search), %{"term" => "test"})
      assert response = json_response(conn, 200)
      assert length(response) == 2
      assert Enum.at(response, 0)["id"] == group1.id
      assert Enum.at(response, 1)["id"] == group2.id
    end

    test "only includes private groups if user is a member", %{conn: conn, team: team, user: user} do
      group = insert(:group, team: team, name: "Test", public: false)
      insert(:group, team: team, slug: "Test", public: false)
      insert(:group_user, group: group, user: user)

      conn = post(conn, api_v1_group_path(conn, :search), %{"term" => "test"})
      assert response = json_response(conn, 200)
      assert length(response) == 1
      assert Enum.at(response, 0)["id"] == group.id
    end

    test "guests can only search within their restricted groups", %{conn: conn, team: team} do
      group = insert(:group, team: team, slug: "Test", public: false)
      insert(:group, team: team, name: "Test", public: true)
      insert(:group, team: team, name: "Test-Test")

      for role <- ["single-room-guest", "multi-room-guest"] do
        guest = insert(:user, team: team, roles: [role], groups_as_guest: [group.id])
        insert(:group_user, group: group, user: guest)
        conn =
          conn
          |> with_api_user(guest)
          |> post(api_v1_group_path(conn, :search), %{"term" => "test"})
        assert response = json_response(conn, 200)
        assert length(response) == 1
        assert Enum.at(response, 0)["id"] == group.id
      end
    end
  end
end
