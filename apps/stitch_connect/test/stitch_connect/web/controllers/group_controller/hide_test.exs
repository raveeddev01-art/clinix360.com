defmodule StitchConnect.Web.GroupController.HideTest do
  use StitchConnect.Web.ConnCase, async: true
  import StitchConnect.Web.SubdomainRouter.Helpers
  alias Stitch.{Group, GroupUser, Repo}

  describe "PUT /api/v1/groups/:id/hide" do
    setup %{conn: conn} do
      team = insert(:team)
      bob = insert(:user, team: team, first_name: "Bob")
      joe = insert(:user, team: team, first_name: "Joe")
      sam = insert(:user, team: team, first_name: "Sam")

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(bob)

      {:ok, conn: conn, team: team, bob: bob, joe: joe, sam: sam}
    end

    test "hides a single DM", %{conn: conn, bob: bob, joe: joe} do
      {:ok, group} = Group.create_single_dm(bob, [bob.id, joe.id])

      conn = put(conn, api_v1_group_path(conn, :hide, group))
      assert response = json_response(conn, 200)
      assert response["message"] =~ "hidden"
      group_user = Repo.get_by(GroupUser, group_id: group.id, user_id: bob.id)
      assert group_user.is_hidden
    end

    test "hides a multi DM", %{conn: conn, bob: bob, joe: joe, sam: sam} do
      {:ok, group} = Group.create_multi_dm(bob, [bob.id, joe.id, sam.id])

      conn = put(conn, api_v1_group_path(conn, :hide, group))
      assert response = json_response(conn, 200)
      assert response["message"] =~ "hidden"
      group_user = Repo.get_by(GroupUser, group_id: group.id, user_id: bob.id)
      assert group_user.is_hidden
    end

    test "gives error when the group is not a DM", %{conn: conn, team: team, bob: bob} do
      group = insert(:group, team: team, creator: bob)

      conn = put(conn, api_v1_group_path(conn, :hide, group))
      assert response = json_response(conn, :unprocessable_entity)
      assert response["message"] == "Only your direct messages can be hidden."
    end

    test "gives error when the user is not part of the DM", %{conn: conn, joe: joe, sam: sam} do
      {:ok, group} = Group.create_single_dm(joe, [joe.id, sam.id])

      conn = put(conn, api_v1_group_path(conn, :hide, group))
      assert response = json_response(conn, :unprocessable_entity)
      assert response["message"] == "Only your direct messages can be hidden."
    end
  end
end
