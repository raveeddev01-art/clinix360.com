defmodule StitchConnect.Web.GroupController.RenameTest do
  use StitchConnect.Web.ConnCase

  import StitchConnect.Web.SubdomainRouter.Helpers

  setup %{conn: conn} do
    team = insert(:team)
    user = insert(:user, team: team, roles: ["admin"])
    admin = insert(:user, team: team, username: "admin", roles: ["admin"])
    group = insert(:group, team: team)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(user)
      |> with_api_user(user)

    {:ok, conn: conn, team: team, group: group, admin: admin}
  end

  test "responds with the updated group", %{conn: conn, group: group} do
    json =
      conn
      |> patch(api_v1_group_path(conn, :rename, group), %{"name" => "Foo"})
      |> json_response(200)

    assert %{"name" => "Foo", "slug" => "foo"} = json
  end

  test "using an existing name/slug", %{conn: conn, team: team, group: group} do
    insert(:group, team: team, slug: "foo")

    json =
      conn
      |> patch(api_v1_group_path(conn, :rename, group), %{"name" => "Foo"})
      |> json_response(:unprocessable_entity)

    assert %{"message" => "Name has to be unique"} = json
  end

  test "doesn't allow to rename group from another team", %{conn: conn} do
    group = insert(:group, public: true)

    json =
      conn
      |> patch(api_v1_group_path(conn, :rename, group), %{"name" => "Foo"})
      |> json_response(401)

    assert %{"message" => "Not authorized to rename this room"} = json
  end

  test "doesn't allow admin to rename private group from another team", %{conn: conn, team: team, admin: admin} do
    group = insert(:group, public: false)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(admin)
      |> with_api_user(admin)

    json =
      conn
      |> patch(api_v1_group_path(conn, :rename, group), %{"name" => "Foo"})
      |> json_response(401)

    assert %{"message" => "Not authorized to rename this room"} = json
  end
end
