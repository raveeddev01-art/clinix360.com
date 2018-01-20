defmodule StitchConnect.Web.GroupController.CreateTest do
  use StitchConnect.Web.ConnCase, async: true
  import Phoenix.ChannelTest
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "POST /api/v1/groups" do
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

      {:ok, conn: conn, team: team, bob: bob, joe: joe, sam: sam, tim: tim}
    end

    test "creates a new group", %{conn: conn, joe: joe, sam: sam} do
      params = %{"user_ids" => [joe.id, sam.id], "name" => "Emergency Room", "slug"=> "Emergency Room"}
      conn = post(conn, api_v1_group_path(conn, :create), params)

      assert response = json_response(conn, 200)
      group_id = response["id"]

      assert Stitch.Repo.get_by(Stitch.GroupUser, user_id: joe.id, group_id: group_id)
      assert Stitch.Repo.get_by(Stitch.GroupUser, user_id: sam.id, group_id: group_id)
    end

    test "broadcasts system messages for invited users", %{conn: conn, bob: bob, joe: joe, sam: sam} do
      user_ids = Enum.map([bob, joe, sam], &(&1.id))
      Enum.each(user_ids, &(@endpoint.subscribe("events:#{&1}")))
      params = %{"user_ids" => user_ids, "name" => "Emergency Room", "slug"=> "Emergency Room"}

      conn = post(conn, api_v1_group_path(conn, :create), params)
      assert json_response(conn, 200)

      Enum.each(user_ids, fn user_id ->
        assert_broadcast "new_message", %{type: "system", fields: %{user: %{id: ^user_id}}}
      end)
    end
  end
end
