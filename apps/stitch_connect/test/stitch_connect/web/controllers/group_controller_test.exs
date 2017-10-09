defmodule StitchConnect.Web.GroupControllerTest do
  use StitchConnect.Web.ConnCase
  import Phoenix.ChannelTest
  alias StitchConnect.Web.UserSocket

  describe "GET /api/v1/groups?slug=slug" do
    test "returns real name and type as regular for regular groups", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team, public: true, name: "Group Nameee")

      json = conn
      |> subdomain(team.slug)
      |> get_as_user(user, "/api/v1/groups", %{slug: group.slug})
      |> json_response(200)

      assert json["type"] == "regular"
      assert json["name"] == group.name
    end

    test "returns other user's name and type as dm for dm groups", %{conn: conn} do
      team = insert(:team)
      user1 = insert(:user, team: team)
      user2 = insert(:user, team: team)

      ids_pair = [user1.id, user2.id] |> Enum.sort |> Enum.join(".")
      group_slug = "__dm:#{ids_pair}"

      # create dm group
      assert {:ok, socket} = Phoenix.ChannelTest.connect(UserSocket, %{"authenticationToken" => user1.token})
      {:ok, _, socket} = subscribe_and_join(socket, "groups:__dm:#{ids_pair}")
      ref = push socket, "new_msg", %{text_content: "Hello, My Friend!"}
      assert_reply ref, :ok, _reply

      json = conn
      |> subdomain(team.slug)
      |> get_as_user(user1, "/api/v1/groups", %{slug: group_slug})
      |> json_response(200)

      assert json["type"] == "dm"
      assert json["name"] == "#{user2.first_name} #{user2.last_name}"
    end

    test "returns first names and type as multi_dm", %{conn: conn} do
      team = insert(:team)
      user1 = insert(:user, team: team, first_name: "Athos")
      user2 = insert(:user, team: team, first_name: "Porthos")
      user3 = insert(:user, team: team, first_name: "Aramis")

      json1 = conn
      |> subdomain(team.slug)
      |> post_as_user(user1, "/api/v1/groups/multi-dm", %{user_ids: [user1.id, user2.id, user3.id]})
      |> json_response(200)

      assert json1["type"] == "multi_dm"
      assert json1["name"] == "Porthos, Aramis"

      json2 = conn
      |> subdomain(team.slug)
      |> get_as_user(user2, "/api/v1/groups/#{json1["id"]}")
      |> json_response(200)

      assert json2["name"] == "Athos, Aramis"
    end
  end

  describe "GET /rooms/:slug" do
    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      default_group = insert(:group, team: team)
      public_group = insert(:group, team: team)
      private_group = insert(:group, team: team, public: false)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_user_session(user)

      {:ok, conn: conn, default_group: default_group, public_group: public_group, private_group: private_group}
    end

    test "redirects to default group when target group doesn't exist", %{conn: conn, default_group: default_group} do
      conn = get(conn, StitchConnect.Web.SubdomainRouter.Helpers.group_path(conn, :index, "bad-id"))
      assert redirected_to(conn) == StitchConnect.Web.SubdomainRouter.Helpers.group_path(conn, :index, default_group.slug)
    end

    test "redirects to default group when target group is private and user isn't a member",
      %{conn: conn, default_group: default_group, private_group: private_group} do
      conn = get(conn, StitchConnect.Web.SubdomainRouter.Helpers.group_path(conn, :index, private_group.slug))
      assert redirected_to(conn) == StitchConnect.Web.SubdomainRouter.Helpers.group_path(conn, :index, default_group.slug)
    end

    test "renders the page for an existing public group", %{conn: conn, public_group: public_group} do
      expected_path = StitchConnect.Web.SubdomainRouter.Helpers.group_path(conn, :index, public_group.slug)
      conn = get(conn, expected_path)
      assert html_response(conn, 200) =~ "<div id=\"root\""
      assert Phoenix.Controller.current_path(conn) == expected_path
    end
  end

  describe "POST /api/v1/groups/:id/leave" do
    import StitchConnect.Web.SubdomainRouter.Helpers

    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      default_group = insert(:group, team: team, slug: "general")
      other_group = insert(:group, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_user_session(user)

      {:ok, conn: conn, user: user, default_group: default_group, other_group: other_group}
    end

    test "when user is leaving a non-default group that he is a part of", %{
      conn: conn, user: user, other_group: group
    } do
      insert(:group_user, group: group, user: user)
      expected_redirect_path = "/groups/general"

      json =
        conn
        |> with_api_user(user)
        |> post(api_v1_group_path(conn, :leave, group))
        |> json_response(200)

      assert %{
        "message" => "User has been removed from the group",
        "redirect_to" => ^expected_redirect_path
      } = json
    end

    test "when user is leaving a non-default group that he isn't a part of", %{
      conn: conn, user: user, other_group: group
    } do
      json =
        conn
        |> with_api_user(user)
        |> post(api_v1_group_path(conn, :leave, group))
        |> json_response(:unprocessable_entity)

      assert %{"message" => "User is not part of this group"} = json
    end
  end

  describe "PATCH /api/v1/groups/:id/rename" do
    import StitchConnect.Web.SubdomainRouter.Helpers

    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_user_session(user)
        |> with_api_user(user)

      {:ok, conn: conn, team: team, group: group}
    end

    test "responds with the updated group", %{conn: conn, group: group} do
      json =
        conn
        |> patch(api_v1_group_path(conn, :rename, group), %{"name" => "Foo"})
        |> json_response(200)

      assert %{"name" => "Foo", "slug" => "foo"} = json
    end

    test "using an existing name/slug", %{conn: conn, team: team, group: group} do
      insert(:group, team: team, slug: "foo")

      json =
        conn
        |> patch(api_v1_group_path(conn, :rename, group), %{"name" => "Foo"})
        |> json_response(:unprocessable_entity)

      assert %{"message" => "Name has to be unique"} = json
    end
  end

  describe "POST /api/v1/groups/dm" do
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
        "favorite" => false,
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
      %{"id" => group_id} =
        conn
        |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => [bob.id, joe.id]})
        |> json_response(200)

      json =
        conn
        |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => [bob.id, joe.id]})
        |> json_response(200)

      expected_slug = "__dm:#{bob.id}.#{joe.id}"

      assert %{
        "id" => ^group_id,
        "name" => _,
        "slug" => ^expected_slug,
        "public" => false,
        "favorite" => false,
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

      assert_broadcast "new_group", %{id: ^group_id, name: "Bob Dylan"}
      assert_broadcast "new_group", %{id: ^group_id, name: "Joe Schmo"}
    end
  end

  describe "POST /api/v1/groups/multi-dm" do
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
        "name" => _,
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
        "name" => _,
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
end
