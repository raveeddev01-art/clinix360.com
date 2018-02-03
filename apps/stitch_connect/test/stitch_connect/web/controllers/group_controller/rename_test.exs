defmodule StitchConnect.Web.GroupController.RenameTest do
  use StitchConnect.Web.ConnCase
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "PATCH /api/v1/groups/:id/rename" do
    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team, roles: ["admin"])
      admin = insert(:user, team: team, username: "admin", roles: ["admin"])
      group = insert(:group, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      {:ok, conn: conn, team: team, group: group, admin: admin}
    end

    test "updates a group's name", %{conn: conn, group: group} do
      json =
        conn
        |> patch(api_v1_group_path(conn, :rename, group), %{"name" => "Foo"})
        |> json_response(200)

      assert %{"name" => "Foo", "slug" => "foo"} = json
    end

    test "errors on duplicate names", %{conn: conn, team: team, group: group} do
      insert(:group, team: team, slug: "foo")

      json =
        conn
        |> patch(api_v1_group_path(conn, :rename, group), %{"name" => "Foo"})
        |> json_response(:unprocessable_entity)

      assert %{"message" => "Name has to be unique"} = json
    end

    test "doesn't allow to rename group from another team", %{conn: conn} do
      group = insert(:group, public: true)

      conn = patch(conn, api_v1_group_path(conn, :rename, group), %{"name" => "Foo"})
      assert response = json_response(conn, :not_found)
      assert response["errors"] =~ "does not exist"
    end

    test "doesn't allow admin to rename private group from another team", %{conn: conn, team: team, admin: admin} do
      group = insert(:group, public: false)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(admin)

      conn = patch(conn, api_v1_group_path(conn, :rename, group), %{"name" => "Foo"})
      assert response = json_response(conn, :not_found)
      assert response["errors"] =~ "does not exist"
    end

    test "doesn't allow guests to rename groups", %{conn: base_conn, team: team, group: group} do
      other_group = insert(:group, team: team)
      for role <- ["single-room-guest", "multi-room-guest"] do
        guest = insert(:user, team: team, roles: [role], groups_as_guest: [group.id])
        insert(:group_user, group: group, user: guest)
        base_conn = with_api_user(base_conn, guest)

        conn = patch(base_conn, api_v1_group_path(base_conn, :rename, group), %{"name" => "Foo"})
        assert response = json_response(conn, :forbidden)
        assert response["message"] =~ "not authorized"

        conn = patch(base_conn, api_v1_group_path(base_conn, :rename, other_group), %{"name" => "Foo"})
        assert response = json_response(conn, :not_found)
        assert response["errors"] =~ "does not exist"
      end
    end
  end
end
