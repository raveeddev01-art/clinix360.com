defmodule StitchConnect.Web.GroupController.LeaveTest do
  use StitchConnect.Web.ConnCase
  import StitchConnect.Web.SubdomainRouter.Helpers

  setup %{conn: conn} do
    team = insert(:team)
    user = insert(:user, team: team)
    default_group = insert(:group, team: team, slug: "general", is_default: true)
    other_group = insert(:group, team: team)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(user)
      |> with_api_user(user)

    {:ok, conn: conn, user: user, default_group: default_group, other_group: other_group}
  end

  test "when user is leaving a non-default group that he is a part of", %{
    conn: conn, user: user, other_group: group
  } do
    insert(:group_user, group: group, user: user)
    expected_redirect_path = "/rooms/general"

    json =
      conn
      |> post(api_v1_group_path(conn, :leave, group))
      |> json_response(200)

    assert %{
      "message" => "User has been removed from the room",
      "redirect_to" => ^expected_redirect_path
    } = json
  end

  test "when user is leaving a non-default group that he isn't a part of", %{
    conn: conn, other_group: group
  } do
    json =
      conn
      |> post(api_v1_group_path(conn, :leave, group))
      |> json_response(:unprocessable_entity)

    assert %{"message" => "User is not part of this room"} = json
  end
end
