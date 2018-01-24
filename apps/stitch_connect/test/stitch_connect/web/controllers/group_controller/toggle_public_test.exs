defmodule StitchConnect.Web.GroupController.TogglePublicTest do
  use StitchConnect.Web.ConnCase, async: true
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "POST /api/v1/groups/:id/toggle-public" do
    setup %{conn: conn} do
      team = insert(:team)
      bob = insert(:user, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(bob)

      {:ok, conn: conn, team: team, bob: bob}
    end

    test "gives error when user isn't creator of the room", %{conn: conn, team: team} do
      joe = insert(:user, team: team)
      group = insert(:group, team: team, creator: joe)

      conn = post(conn, api_v1_group_path(conn, :toggle_public, group), %{"public" => false})
      assert response = json_response(conn, :forbidden)
      assert response["message"] =~ "authorized"
    end

    test "can make a group public", %{conn: conn, team: team, bob: bob} do
      group = insert(:group, team: team, creator: bob, public: false)

      conn = post(conn, api_v1_group_path(conn, :toggle_public, group), %{"public" => true})
      assert response = json_response(conn, 200)
      assert response["public"]
      assert %{
        "joined" => _,
        "is_favorite" => _,
        "unread_messages_count" => _,
        "mentions_count" => _,
        "last_read_at" => _,
      } = response
    end

    test "can make a group private", %{conn: conn, team: team, bob: bob} do
      group = insert(:group, team: team, creator: bob, public: true)
      insert(:group_user, group: group, user: bob)

      conn = post(conn, api_v1_group_path(conn, :toggle_public, group), %{"public" => false})
      assert response = json_response(conn, 200)
      refute response["public"]
      assert %{
        "joined" => _,
        "is_favorite" => _,
        "unread_messages_count" => _,
        "mentions_count" => _,
        "last_read_at" => _,
      } = response
    end

    test "allows admins to modify privacy settings", %{conn: conn, team: team, bob: user} do
      group = insert(:group, team: team, creator: user, public: false)
      admin = insert(:user, team: team, roles: ["admin"])
      insert(:group_user, group: group, user: admin)

      conn =
        conn
        |> with_api_user(admin)
        |> post(api_v1_group_path(conn, :toggle_public, group), %{"public" => false})
      assert response = json_response(conn, 200)
      refute response["public"]
    end

    test "gives error when modifying default group's privacy", %{conn: conn, team: team} do
      group = insert(:group, team: team, creator: nil, public: true, is_default: true)
      admin = insert(:user, team: team, roles: ["admin"])

      conn =
        conn
        |> with_api_user(admin)
        |> post(api_v1_group_path(conn, :toggle_public, group), %{"public" => false})
      assert response = json_response(conn, :unprocessable_entity)
      assert response["message"] =~ "default"
    end

    test "gives error for non-existent rooms", %{conn: conn} do
      conn = post(conn, api_v1_group_path(conn, :toggle_public, -1), %{"public" => false})
      assert response = json_response(conn, :not_found)
      assert response["errors"] =~ "does not exist"
    end

    test "restricts guests from modifying privacy settings", %{conn: base_conn, team: team} do
      group = insert(:group, team: team)
      for role <- ["single-room-guest", "multi-room-guest"] do
        guest = insert(:user, team: team, roles: [role], groups_as_guest: [group.id])
        insert(:group_user, group: group, user: guest)
        base_conn = with_api_user(base_conn, guest)

        conn = post(base_conn, api_v1_group_path(base_conn, :toggle_public, group), %{"public" => false})
        assert response = json_response(conn, :forbidden)
        assert response["message"] =~ "authorized"

        conn = post(base_conn, api_v1_group_path(base_conn, :toggle_public, -1), %{"public" => false})
        assert response = json_response(conn, :forbidden)
        assert response["message"] =~ "authorized"
      end
    end
  end
end
