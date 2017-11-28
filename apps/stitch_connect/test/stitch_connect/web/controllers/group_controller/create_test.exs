defmodule StitchConnect.Web.GroupController.CreateTest do
  use StitchConnect.Web.ConnCase
  import Phoenix.ChannelTest
  import StitchConnect.Web.SubdomainRouter.Helpers

  setup %{conn: conn} do
    team = insert(:team)
    bob = insert(:user, team: team, first_name: "Bob")
    joe = insert(:user, team: team, first_name: "Joe")
    sam = insert(:user, team: team, first_name: "Sam")
    tim = insert(:user, team: team, first_name: "Tim")

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(bob)
      |> with_api_user(bob)

    {:ok, conn: conn, bob: bob, joe: joe, sam: sam, tim: tim}
  end

  test "creates group, invites users from user_ids, creates system messages", %{conn: conn, joe: joe, sam: sam} do
    json =
      conn
      |> post(api_v1_group_path(conn, :create), %{"user_ids" => [joe.id, sam.id], "name" => "Emergency Room"})
      |> json_response(200)

    assert %{"id" => group_id} = json

    assert Stitch.Repo.get_by(Stitch.GroupUser, user_id: joe.id, group_id: group_id) != nil
    assert Stitch.Repo.get_by(Stitch.GroupUser, user_id: sam.id, group_id: group_id) != nil
  end

  test "broadcasts system messages for invited users", %{conn: conn, bob: bob, joe: joe, sam: sam} do
    user_ids = Enum.map([bob, joe, sam], &(&1.id))
    Enum.each(user_ids, &(@endpoint.subscribe("events:#{&1}")))

    conn
    |> post(api_v1_group_path(conn, :create), %{"user_ids" => user_ids, "name" => "Emergency Room"})
    |> json_response(200)

    Enum.each(user_ids, fn user_id ->
      assert_broadcast "new_message", %{type: "system", fields: %{user: %{id: ^user_id}}}
    end)
  end
end
