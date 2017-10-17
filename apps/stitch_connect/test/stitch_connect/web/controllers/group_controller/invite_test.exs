defmodule StitchConnect.Web.GroupController.InviteTest do
  use StitchConnect.Web.ConnCase
  import StitchConnect.Web.SubdomainRouter.Helpers

  setup %{conn: conn} do
    team = insert(:team)
    bob = insert(:user, team: team)
    joe = insert(:user, team: team)
    sam = insert(:user, team: team)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(bob)
      |> with_api_user(bob)

    {:ok, conn: conn, team: team, bob: bob, joe: joe, sam: sam}
  end

  test "when user is not authorized to invite to the group", %{conn: conn, team: team, joe: joe, sam: sam} do
    group = insert(:group, team: team, creator: joe, public: false)

    %{"message" => message} =
      conn
      |> post(api_v1_group_path(conn, :invite, group), %{"user_ids" => Enum.join([sam.id], ",")})
      |> json_response(:unauthorized)

    assert message == "Not authorized to invite people to this group."
  end

  test "responds with 200 and a success message", %{conn: conn, team: team, bob: bob, joe: joe, sam: sam} do
    group = insert(:group, team: team, creator: bob, public: false)

    %{"message" => message} =
      conn
      |> post(api_v1_group_path(conn, :invite, group), %{"user_ids" => Enum.join([joe.id, sam.id], ",")})
      |> json_response(200)

    assert message == "Users invited to group."
  end
end
