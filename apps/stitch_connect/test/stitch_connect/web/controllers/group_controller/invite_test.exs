defmodule StitchConnect.Web.GroupController.InviteTest do
  use StitchConnect.Web.ConnCase
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "POST /api/v1/groups/:id/invite" do
    setup %{conn: conn} do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      sam = insert(:user, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(bob)

      {:ok, conn: conn, team: team, bob: bob, joe: joe, sam: sam}
    end

    test "gives error when user is not authorized to invite to the group", %{conn: conn, team: team, joe: joe, sam: sam} do
      group = insert(:group, team: team, creator: joe, public: false)

      %{"message" => message} =
        conn
        |> post(api_v1_group_path(conn, :invite, group), %{"user_ids" => Enum.join([sam.id], ",")})
        |> json_response(:unauthorized)

      assert message == "Not authorized to invite people to this room."
    end

    test "responds with 200 and a success message", %{conn: conn, team: team, bob: bob, joe: joe, sam: sam} do
      group = insert(:group, team: team, creator: bob, public: false)

      %{"message" => message} =
        conn
        |> post(api_v1_group_path(conn, :invite, group), %{"user_ids" => Enum.join([joe.id, sam.id], ",")})
        |> json_response(200)

      assert message == "Users invited to room."
    end

    test "ignores user ids belonging to a different team", %{conn: conn, bob: bob, team: team} do
      team2 = insert(:team)
      user2 = insert(:user, team: team2)
      group = insert(:group, team: team, creator: bob, public: false)

      params = %{"user_ids" => "#{user2.id}"}
      conn = post(conn, api_v1_group_path(conn, :invite, group), params)
      assert json_response(conn, 200)

      assert Stitch.Repo.get_by(Stitch.GroupUser, user_id: user2.id, group_id: group.id) == nil
    end
  end

  test "can't invite user from another team", %{conn: conn, team: team_a} do
    group_a = insert(:group, team: team_a, is_default: true)

    team_b = insert(:team)
    group_b = insert(:group, team: team_b, is_default: true)
    user_b = insert(:user, team: team_b)
    insert(:group_user, group: group_b, user: user_b)

    conn
    |> post(api_v1_group_path(conn, :invite, group_a.id), %{
      "user_ids" => Enum.join([user_b.id], ",")
    })
    |> json_response(200)

    assert Stitch.Repo.get_by(Stitch.GroupUser, user_id: user_b.id, group_id: group_a.id) == nil
  end
end
