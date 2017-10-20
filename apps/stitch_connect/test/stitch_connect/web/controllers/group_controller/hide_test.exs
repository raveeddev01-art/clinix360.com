defmodule StitchConnect.Web.GroupController.HideTest do
  use StitchConnect.Web.ConnCase
  import StitchConnect.Web.SubdomainRouter.Helpers
  alias Stitch.{Group, GroupUser, Repo}

  setup %{conn: conn} do
    team = insert(:team)
    bob = insert(:user, team: team, first_name: "Bob")
    joe = insert(:user, team: team, first_name: "Joe")
    sam = insert(:user, team: team, first_name: "Sam")

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(bob)
      |> with_api_user(bob)

    {:ok, conn: conn, team: team, bob: bob, joe: joe, sam: sam}
  end

  test "sets a single DM's is_hidden field to true", %{conn: conn, bob: bob, joe: joe} do
    {:ok, group} = Group.create_single_dm(bob, [bob.id, joe.id])

    %{"message" => message} =
      conn
      |> put(api_v1_group_path(conn, :hide, group))
      |> json_response(200)

    group_user = Repo.get_by(GroupUser, group_id: group.id, user_id: bob.id)
    assert group_user.is_hidden
    assert message == "Room hidden"
  end

  test "sets a multi DM's is_hidden field to true", %{conn: conn, bob: bob, joe: joe, sam: sam} do
    {:ok, group} = Group.create_multi_dm(bob, [bob.id, joe.id, sam.id])

    %{"message" => message} =
      conn
      |> put(api_v1_group_path(conn, :hide, group))
      |> json_response(200)

    group_user = Repo.get_by(GroupUser, group_id: group.id, user_id: bob.id)
    assert group_user.is_hidden
    assert message == "Room hidden"
  end

  test "when the group is not a DM", %{conn: conn, team: team, bob: bob} do
    group = insert(:group, team: team, creator: bob)

    %{"message" => message} =
      conn
      |> put(api_v1_group_path(conn, :hide, group))
      |> json_response(:forbidden)

    assert message == "Only direct messages can be hidden"
  end

  test "when the user is not part of the DM", %{conn: conn, joe: joe, sam: sam} do
    {:ok, group} = Group.create_single_dm(joe, [joe.id, sam.id])

    %{"message" => message} =
      conn
      |> put(api_v1_group_path(conn, :hide, group))
      |> json_response(:forbidden)

    assert message == "User is not part of this room"
  end
end
