defmodule StitchConnect.Web.GroupController.CreateMultiDmTest do
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
      "name" => "Joe, Sam",
      "slug" => ^expected_slug,
      "public" => false,
      "favorite" => false,
      "description" => nil,
      "joined" => true,
      "users" => [_, _, _],
      "type" => "multi_dm",
      "user_count" => 3,
      "unread_messages_count" => 0,
      "mentions_count" => 0,
      "last_read_at" => nil
    } = json
  end

  test "when DM with the same user IDs exists", %{conn: conn, bob: bob, joe: joe, sam: sam} do
    %{"id" => group_id} =
      conn
      |> post(api_v1_group_path(conn, :create_multi_dm), %{"user_ids" => [bob.id, joe.id, sam.id]})
      |> json_response(200)

    json =
      conn
      |> post(api_v1_group_path(conn, :create_multi_dm), %{"user_ids" => [bob.id, joe.id, sam.id]})
      |> json_response(200)

    expected_slug = "__dm:#{bob.id}.#{joe.id}.#{sam.id}"

    assert %{
      "id" => ^group_id,
      "name" => "Joe, Sam",
      "slug" => ^expected_slug,
      "public" => false,
      "favorite" => false,
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

    assert_broadcast "new_group", %{id: ^group_id, name: "Bob, Joe"}
    assert_broadcast "new_group", %{id: ^group_id, name: "Bob, Sam"}
    assert_broadcast "new_group", %{id: ^group_id, name: "Joe, Sam"}
  end
end
