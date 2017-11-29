defmodule StitchConnect.Web.GroupController.CreateSingleDmTest do
  use StitchConnect.Web.ConnCase
  import Phoenix.ChannelTest
  import StitchConnect.Web.SubdomainRouter.Helpers

  setup %{conn: conn} do
    team = insert(:team)
    bob = insert(:user, team: team, first_name: "Bob", last_name: "Dylan")
    joe = insert(:user, team: team, first_name: "Joe", last_name: "Schmo")
    tim = insert(:user, team: team, first_name: "Tim")

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(bob)
      |> with_api_user(bob)

    {:ok, conn: conn, bob: bob, joe: joe, tim: tim}
  end

  test "when there user_ids is empty", %{conn: conn} do
    json =
      conn
      |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => []})
      |> json_response(:bad_request)

    assert %{"message" => "user_ids param should contain 2 ids"} = json
  end

  test "when there is just 1 user_id", %{conn: conn, bob: bob} do
    json =
      conn
      |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => [bob.id]})
      |> json_response(:bad_request)

    assert %{"message" => "user_ids param should contain 2 ids"} = json
  end

  test "when there are more than 2 user_ids", %{conn: conn, bob: bob, joe: joe, tim: tim} do
    json =
      conn
      |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => [bob.id, joe.id, tim.id]})
      |> json_response(:bad_request)

    assert %{"message" => "user_ids param should contain 2 ids"} = json
  end

  test "when users_ids is neither the current user's", %{conn: conn, joe: joe, tim: tim} do
    json =
      conn
      |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => [joe.id, tim.id]})
      |> json_response(:bad_request)

    assert %{"message" => "user_ids param has to contain current user's id"} = json
  end

  test "when the other user_id is the current user's", %{conn: conn, bob: bob, joe: joe} do
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
      "last_read_at" => nil
    } = json
  end

  test "when DM with the same user IDs exists", %{conn: conn, bob: bob, joe: joe} do
    {:ok, group} = Stitch.Group.create_single_dm(bob, [bob.id, joe.id])
    {:ok, _group_user} = Stitch.Group.hide(group, bob.id)

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

  test "event is broadcast to all users in the group", %{conn: conn, bob: bob, joe: joe} do
    user_ids = Enum.map([bob, joe], &(&1.id))
    Enum.each(user_ids, &(@endpoint.subscribe("events:#{&1}")))

    %{"id" => group_id} =
      conn
      |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => user_ids})
      |> json_response(200)

    assert_broadcast "created_group", %{id: ^group_id, name: "Bob Dylan"}
    assert_broadcast "created_group", %{id: ^group_id, name: "Joe Schmo"}
  end
end
