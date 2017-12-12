defmodule StitchConnect.Web.GroupController.CreateMultiDmTest do
  use StitchConnect.Web.ConnCase
  import Phoenix.ChannelTest
  import StitchConnect.Web.SubdomainRouter.Helpers

  setup %{conn: conn} do
    team = insert(:team)
    bob = insert(:user, team: team, first_name: "Bob", last_name: "Hadden")
    joe = insert(:user, team: team, first_name: "Joe", last_name: "Schmo")
    sam = insert(:user, team: team, first_name: "Sam", last_name: "Capra")
    tim = insert(:user, team: team, first_name: "Tim", last_name: "Kilaru")

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(bob)
      |> with_api_user(bob)

    {:ok, conn: conn, bob: bob, joe: joe, sam: sam, tim: tim}
  end

  test "when there user_ids is empty", %{conn: conn} do
    json =
      conn
      |> post(api_v1_group_path(conn, :create_multi_dm), %{"user_ids" => []})
      |> json_response(:bad_request)

    assert %{"message" => "user_ids param should contain more than 2 ids"} = json
  end

  test "when user_ids only has 1 id", %{conn: conn, bob: bob} do
    json =
      conn
      |> post(api_v1_group_path(conn, :create_multi_dm), %{"user_ids" => [bob.id]})
      |> json_response(:bad_request)

    assert %{"message" => "user_ids param should contain more than 2 ids"} = json
  end

  test "when user_ids only has 2 ids", %{conn: conn, bob: bob, joe: joe} do
    json =
      conn
      |> post(api_v1_group_path(conn, :create_multi_dm), %{"user_ids" => [bob.id, joe.id]})
      |> json_response(:bad_request)

    assert %{"message" => "user_ids param should contain more than 2 ids"} = json
  end

  test "when user_ids doesn't include the current user's", %{conn: conn, joe: joe, sam: sam, tim: tim} do
    json =
      conn
      |> post(api_v1_group_path(conn, :create_multi_dm), %{"user_ids" => [joe.id, sam.id, tim.id]})
      |> json_response(:bad_request)

    assert %{"message" => "user_ids param has to contain current user's id"} = json
  end

  test "when user_ids has 3 or more ids including the current user's", %{conn: conn, bob: bob, joe: joe, sam: sam} do
    json =
      conn
      |> post(api_v1_group_path(conn, :create_multi_dm), %{"user_ids" => [bob.id, joe.id, sam.id]})
      |> json_response(200)

    expected_slug = "__dm:#{bob.id}.#{joe.id}.#{sam.id}"

    assert %{
      "id" => _,
      "name" => "Joe Schmo, Sam Capra",
      "slug" => ^expected_slug,
      "public" => false,
      "is_favorite" => false,
      "description" => nil,
      "joined" => true,
      "users" => [_, _, _],
      "type" => "multi_dm",
      "user_count" => 3,
      "unread_messages_count" => 0,
      "mentions_count" => 0,
      "last_read_at" => _
    } = json
  end

  test "when DM with the same user IDs exists", %{conn: conn, bob: bob, joe: joe, sam: sam} do
    {:ok, group} = Stitch.Group.create_multi_dm(bob, [bob.id, joe.id, sam.id])
    {:ok, _group_user} = Stitch.Group.hide(group, bob.id)

    json =
      conn
      |> post(api_v1_group_path(conn, :create_multi_dm), %{"user_ids" => [bob.id, joe.id, sam.id]})
      |> json_response(200)

    group_id = group.id
    expected_slug = "__dm:#{bob.id}.#{joe.id}.#{sam.id}"

    assert %{
      "id" => ^group_id,
      "name" => "Joe Schmo, Sam Capra",
      "slug" => ^expected_slug,
      "public" => false,
      "is_favorite" => false,
      "is_hidden" => false,
      "description" => nil,
      "joined" => true,
      "users" => [_, _, _],
      "type" => "multi_dm",
      "user_count" => 3,
      "unread_messages_count" => 0,
      "mentions_count" => 0,
      "last_read_at" => _
    } = json
  end

  test "event is broadcast to all users in the group", %{conn: conn, bob: bob, joe: joe, sam: sam} do
    user_ids = Enum.map([bob, joe, sam], &(&1.id))
    Enum.each(user_ids, &(@endpoint.subscribe("events:#{&1}")))

    %{"id" => group_id} =
      conn
      |> post(api_v1_group_path(conn, :create_multi_dm), %{"user_ids" => user_ids})
      |> json_response(200)

    assert_broadcast "created_group", %{id: ^group_id, name: "Bob Hadden, Joe Schmo"}
    assert_broadcast "created_group", %{id: ^group_id, name: "Bob Hadden, Sam Capra"}
    assert_broadcast "created_group", %{id: ^group_id, name: "Joe Schmo, Sam Capra"}
  end
end
