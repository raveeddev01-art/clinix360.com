defmodule StitchConnect.Web.GroupController.CreateSingleDmTest do
  use StitchConnect.Web.ConnCase, async: true
  import Phoenix.ChannelTest
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "POST /api/v1/groups/dm" do
    setup %{conn: conn} do
      team = insert(:team)
      bob = insert(:user, team: team, first_name: "Bob", last_name: "Dylan")
      joe = insert(:user, team: team, first_name: "Joe", last_name: "Schmo")
      tim = insert(:user, team: team, first_name: "Tim")

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(bob)

      {:ok, conn: conn, team: team, bob: bob, joe: joe, tim: tim}
    end

    test "gives errors with empty user list", %{conn: conn} do
      json =
        conn
        |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => []})
        |> json_response(:bad_request)

      assert %{"message" => "user_ids param should contain 2 ids"} = json
    end

    test "gives error when there is just 1 user_id", %{conn: conn, bob: bob} do
      json =
        conn
        |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => [bob.id]})
        |> json_response(:bad_request)

      assert %{"message" => "user_ids param should contain 2 ids"} = json
    end

    test "gives error when there are more than 2 user_ids", %{conn: conn, bob: bob, joe: joe, tim: tim} do
      json =
        conn
        |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => [bob.id, joe.id, tim.id]})
        |> json_response(:bad_request)

      assert %{"message" => "user_ids param should contain 2 ids"} = json
    end

    test "gives error when users_ids is neither the current user's", %{conn: conn, joe: joe, tim: tim} do
      json =
        conn
        |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => [joe.id, tim.id]})
        |> json_response(:bad_request)

      assert %{"message" => "user_ids param has to contain current user's id"} = json
    end

    test "creates a dm", %{conn: conn, bob: bob, joe: joe} do
      json =
        conn
        |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => [bob.id, joe.id]})
        |> json_response(200)

      expected_slug = "__dm:#{bob.id}.#{joe.id}"

      assert %{
        "id" => _,
        "name" => _,
        "slug" => ^expected_slug,
        "public" => false,
        "is_favorite" => false,
        "description" => nil,
        "joined" => true,
        "users" => [_, _],
        "type" => "dm",
        "user_count" => 2,
        "unread_messages_count" => 0,
        "mentions_count" => 0,
        "last_read_at" => _
      } = json
    end

    test "returns DM when DM already exists", %{conn: conn, bob: bob, joe: joe} do
      {:ok, group} = Stitch.Group.create_single_dm(bob, [bob.id, joe.id])
      {:ok, _group_user} = Stitch.Group.hide(group.id, bob)

      json =
        conn
        |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => [bob.id, joe.id]})
        |> json_response(200)

      group_id = group.id
      expected_slug = "__dm:#{bob.id}.#{joe.id}"

      assert %{
        "id" => ^group_id,
        "name" => _,
        "slug" => ^expected_slug,
        "public" => false,
        "is_favorite" => false,
        "is_hidden" => false,
        "description" => nil,
        "joined" => true,
        "users" => [_, _],
        "type" => "dm",
        "user_count" => 2,
        "unread_messages_count" => 0,
        "mentions_count" => 0,
        "last_read_at" => _
      } = json
    end

    test "broadcast event to all users in the group on successful create", %{conn: conn, bob: bob, joe: joe} do
      user_ids = Enum.map([bob, joe], &(&1.id))
      Enum.each(user_ids, &(@endpoint.subscribe("events:#{&1}")))

      %{"id" => group_id} =
        conn
        |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => user_ids})
        |> json_response(200)

      assert_broadcast "created_group", %{id: ^group_id, name: "Bob Dylan"}
      assert_broadcast "created_group", %{id: ^group_id, name: "Joe Schmo"}
    end

    test "allows guests to invite users from mutually shared groups", %{conn: conn, team: team, bob: bob} do
      group = insert(:group, team: team)
      guest = insert(:user, team: team, roles: ["single-room-guest"], groups_as_guest: [group.id])
      insert(:group_user, group: group, user: bob)
      insert(:group_user, group: group, user: guest)

      conn =
        conn
        |> with_api_user(guest)
        |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => [bob.id, guest.id]})

      assert json_response(conn, 200)
    end

    test "errors when guests invite users from non-mutually shared groups", %{conn: conn, team: team, bob: bob} do
      group = insert(:group, team: team)
      guest = insert(:user, team: team, roles: ["single-room-guest"], groups_as_guest: [group.id])
      insert(:group_user, group: group, user: guest)

      conn =
        conn
        |> with_api_user(guest)
        |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => [bob.id, guest.id]})

      assert response = json_response(conn, :unprocessable_entity)
      assert response["message"] =~ "invalid ids"
    end
  end
end