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
end
