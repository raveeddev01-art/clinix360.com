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

    test "doesn't allow admin to remove group from another team" do
    end

    test "doesn't allow guest to remove group" do
    end

    test "doesn't allow guest to remove group if he is the creator" do
    end

    test "doesn't allow to remove DMs" do
    end

    test "doesn't allow to remove DMs when user is admin" do
    end

    test "doesn't allow to remove a group when user is the creator but no longer a member" do
    end

    test "doesn't allow full member to remove a group when his is a member of the group" do
    end

    test "doesn't allow admin to remove the default group" do
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
