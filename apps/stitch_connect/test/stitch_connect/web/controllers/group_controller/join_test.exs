defmodule StitchConnect.Web.GroupController.JoinTest do
  use StitchConnect.Web.ConnCase
  import StitchConnect.Web.SubdomainRouter.Helpers

  setup %{conn: conn} do
    team = insert(:team)
    group = insert(:group, team: team)
    bob = insert(:user, team: team, first_name: "Bob", last_name: "Dylan")

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(bob)
      |> with_api_user(bob)

    {:ok, conn: conn, bob: bob, group: group}
  end

  test "when user already belongs to the group", %{conn: conn, group: group, bob: bob} do
    insert(:group_user, group: group, user: bob)

    json =
      conn
      |> post(api_v1_group_path(conn, :join, group))
      |> json_response(:unprocessable_entity)

    assert %{"message" => "Cannot add user to the room"} = json
  end

  test "returns group_id and user_id", %{conn: conn, group: group, bob: bob} do
    json =
      conn
      |> post(api_v1_group_path(conn, :join, group))
      |> json_response(200)

    assert json == %{"group_id" => group.id, "user_id" => bob.id}
  end
end
