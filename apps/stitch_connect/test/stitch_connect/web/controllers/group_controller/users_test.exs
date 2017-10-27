defmodule StitchConnect.Web.GroupController.UsersTest do
  use StitchConnect.Web.ConnCase
  import StitchConnect.Web.SubdomainRouter.Helpers

  setup %{conn: conn} do
    team = insert(:team)
    bob = insert(:user, team: team, username: "bob")
    joe = insert(:user, team: team, username: "joe")
    admin = insert(:user, team: team, username: "admin", roles: ["admin"])

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(bob)
      |> with_api_user(bob)

    {:ok, conn: conn, team: team, bob: bob, joe: joe, admin: admin}
  end

  test "when user isn't a member of a private group", %{conn: conn, team: team} do
    group = insert(:group, team: team, public: false)

    json =
      conn
      |> get(api_v1_group_path(conn, :users, group))
      |> json_response(401)

    assert %{"message" => "Not authorized to view this room."} = json
  end

  test "when user isn't a member of a public group", %{conn: conn, team: team, joe: joe} do
    group = insert(:group, team: team, public: true)
    insert(:group_user, group: group, user: joe)

    json =
      conn
      |> get(api_v1_group_path(conn, :users, group))
      |> json_response(200)

    assert [%{"username" => "joe"}] = json
  end

  test "when user is a member of a private group", %{conn: conn, team: team, bob: bob} do
    group = insert(:group, team: team, public: false)
    insert(:group_user, group: group, user: bob)

    json =
      conn
      |> get(api_v1_group_path(conn, :users, group))
      |> json_response(200)

    assert [%{"username" => "bob"}] = json
  end

  test "when user is admin and isn't a member of a public group", %{conn: conn, team: team, admin: admin} do
    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(admin)
      |> with_api_user(admin)

    group = insert(:group, team: team, public: true)

    json =
      conn
      |> get(api_v1_group_path(conn, :users, group))
      |> json_response(200)

    assert [] = json
  end

  test "when user is admin isn't a member of a private group", %{conn: conn, team: team, admin: admin} do
    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(admin)
      |> with_api_user(admin)

    group = insert(:group, team: team, public: false)

    json =
      conn
      |> get(api_v1_group_path(conn, :users, group))
      |> json_response(401)

    assert %{"message" => "Not authorized to view this room."} = json
  end

  test "when user is admin and isn't a member of a public group belonging to another team", %{conn: conn, team: team, admin: admin} do
    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(admin)
      |> with_api_user(admin)

    group = insert(:group, public: true)

    json =
      conn
      |> get(api_v1_group_path(conn, :users, group))
      |> json_response(401)

    assert %{"message" => "Not authorized to view this room."} = json
  end
end
