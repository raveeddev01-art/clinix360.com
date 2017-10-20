defmodule StitchConnect.Web.InvitationControllerTest do
  use StitchConnect.Web.ConnCase
  import StitchConnect.Web.SubdomainRouter.Helpers

  setup %{conn: conn} do
    team = insert(:team)
    group = insert(:group, team: team, is_default: true)
    user = insert(:user, team: team)
    insert(:group_user, group: group, user: user)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(user)
      |> with_api_user(user)

    {:ok, conn: conn, group: group, team: team, user: user}
  end

  test "can't invite user from another team", %{conn: conn, group: group} do
    team2 = insert(:team)
    group2 = insert(:group, team: team2, is_default: true)
    user2 = insert(:user, team: team2)
    insert(:group_user, group: group2, user: user2)

    conn
    |> post(api_v1_group_path(conn, :invite, group.id), %{
      "user_ids" => [user2.id] |> Enum.join(",")
    })
    |> json_response(200)

    assert Stitch.Repo.get_by(Stitch.GroupUser, user_id: user2.id, group_id: group.id) == nil
  end
end
