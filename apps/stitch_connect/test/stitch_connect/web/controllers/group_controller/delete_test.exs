defmodule StitchConnect.Web.GroupController.DeleteTest do
  use StitchConnect.Web.ConnCase
  import Phoenix.ChannelTest
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "DELETE /api/v1/groups/:id" do
    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team, roles: ["member"])
      admin = insert(:user, team: team, username: "admin", roles: ["admin"])
      group = insert(:group, team: team)

      conn =
        conn
        |> with_team_subdomain(team)

      {:ok, conn: conn, team: team, group: group, admin: admin, user: user}
    end

    test "doesn't allow admin to remove group from another team", %{conn: conn, admin: admin} do
      another_group = insert(:group)

      json =
        conn
        |> with_api_user(admin)
        |> delete(api_v1_group_path(conn, :delete, another_group))
        |> json_response(404)

      assert %{"errors" => "The resource you are looking for does not exist."} = json
    end

    test "doesn't allow guest to remove group", %{conn: conn, team: team} do
      for role <- ["single-room-guest", "multi-room-guest"] do
        user = insert(:user, roles: [role], team: team)
        group = insert(:group, creator: user, team: team)
        insert(:group_user, user: user, group: group)

        json =
          conn
          |> with_api_user(user)
          |> delete(api_v1_group_path(conn, :delete, group))
          |> json_response(403)

        assert %{"message" => "You are not authorized to access this resource."} = json
      end
    end

    test "doesn't allow guest to remove group if he is the creator", %{conn: conn, team: team} do
      for role <- ["single-room-guest", "multi-room-guest"] do
        user = insert(:user, roles: [role], team: team)
        group = insert(:group, creator: user, team: team)
        insert(:group_user, user: user, group: group)

        json =
          conn
          |> with_api_user(user)
          |> delete(api_v1_group_path(conn, :delete, group))
          |> json_response(403)

        assert %{"message" => "You are not authorized to access this resource."} = json
      end
    end

    test "doesn't allow to remove DMs", %{conn: conn, user: bob, team: team} do
      joe = insert(:user, team: team, roles: ["member"])
      {:ok, group} = Stitch.Group.create_single_dm(bob, [bob.id, joe.id])

      json =
        conn
        |> with_api_user(bob)
        |> delete(api_v1_group_path(conn, :delete, group))
        |> json_response(403)

      assert %{"message" => "You are not authorized to access this resource."} = json
    end

    test "doesn't allow to remove DMs when user is admin", %{conn: conn, admin: admin, user: user} do
      {:ok, group} = Stitch.Group.create_single_dm(admin, [admin.id, user.id])

      json =
        conn
        |> with_api_user(admin)
        |> delete(api_v1_group_path(conn, :delete, group))
        |> json_response(403)

      assert %{"message" => "You are not authorized to access this resource."} = json
    end

    test "doesn't allow to remove a group when user is the creator but no longer a member", %{conn: conn, team: team, user: user} do
      group = insert(:group, creator: user, team: team)

      json =
        conn
        |> with_api_user(user)
        |> delete(api_v1_group_path(conn, :delete, group))
        |> json_response(403)

      assert %{"message" => "You are not authorized to access this resource."} = json
    end

    test "doesn't allow full member to remove a group when he is a member of the group", %{conn: conn, user: user, team: team} do
      group = insert(:group, team: team, is_default: true)
      insert(:group_user, group: group, user: user)

      json =
        conn
        |> with_api_user(user)
        |> delete(api_v1_group_path(conn, :delete, group))
        |> json_response(403)

      assert %{"message" => "You are not authorized to access this resource."} = json
    end

    test "doesn't allow admin to remove the default group", %{conn: conn, admin: admin, team: team} do
      group = insert(:group, team: team, is_default: true)

      json =
        conn
        |> with_api_user(admin)
        |> delete(api_v1_group_path(conn, :delete, group))
        |> json_response(403)

      assert %{"message" => "You are not authorized to access this resource."} = json
    end

    test "deletes a group", %{conn: conn, group: group, admin: admin, team: team} do
      @endpoint.subscribe("events:#{admin.id}")
      @endpoint.subscribe("team:lobby:#{team.id}")

      guest = insert(:user, team: team, roles: ["single-room-guest"], groups_as_guest: [group.id])
      insert(:group_user, user: guest, group: group)

      json =
        conn
        |> with_api_user(admin)
        |> delete(api_v1_group_path(conn, :delete, group))
        |> json_response(200)

      assert %{"id" => group_id} = json
      assert group_id == group.id

      assert_broadcast "deleted_group", %{group_id: ^group_id}
      assert_broadcast "user_info", %{groups_as_guest: []}
    end
  end
end
