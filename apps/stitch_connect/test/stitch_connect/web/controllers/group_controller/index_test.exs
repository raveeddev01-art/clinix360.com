defmodule StitchConnect.Web.GroupController.IndexTest do
  use StitchConnect.Web.ConnCase
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "GET /api/v1/groups" do
    setup %{conn: conn} do
      team = insert(:team)
      bob = insert(:user, team: team, first_name: "Bob")
      joe = insert(:user, team: team, first_name: "Joe", last_name: "Schmo")

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(bob)

      {:ok, conn: conn, team: team, bob: bob, joe: joe}
    end

    test "lists all available groups", %{conn: conn, team: team, bob: bob} do
      insert(:group, team: team)
      insert(:group, team: team)
      private = insert(:group, team: team, public: false)
      insert(:group, team: team, public: false)
      insert(:group_user, user: bob, group: private)

      conn = get(conn, api_v1_group_path(conn, :index))
      assert response = json_response(conn, 200)
      assert length(response) == 3
    end

    test "gets a group by slug", %{conn: base_conn, team: team} do
      group = insert(:group, team: team)

      conn = get(base_conn, api_v1_group_path(base_conn, :index), %{slug: group.slug})
      assert response = json_response(conn, 200)
      assert response["type"] == "regular"
      assert response["name"] == group.name

      conn = get(base_conn, api_v1_group_path(base_conn, :index), %{slug: "bad"})
      assert json_response(conn, :not_found)
    end

    test "guests only see their restricted groups", %{conn: base_conn, team: team} do
      group1 = insert(:group, team: team)
      group2 = insert(:group, team: team)

      guest = insert(:user, team: team, roles: ["single-room-guest"], groups_as_guest: [group1.id])
      insert(:group_user, group: group1, user: guest)

      base_conn = with_api_user(base_conn, guest)

      conn = get(base_conn, api_v1_group_path(base_conn, :index))
      assert response = json_response(conn, 200)
      assert length(response) == 1
      assert Enum.at(response, 0)["id"] == group1.id

      conn = get(base_conn, api_v1_group_path(base_conn, :index), %{slug: group2.slug})
      assert json_response(conn, :not_found)
    end
  end

  describe "redirects" do
    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      default_group = insert(:group, team: team, is_default: true)
      public_group = insert(:group, team: team)
      private_group = insert(:group, team: team, public: false)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_user_session(user)

      {:ok, conn: conn, default_group: default_group, public_group: public_group, private_group: private_group}
    end

    test "redirects to default group when target group doesn't exist", %{conn: conn, default_group: default_group} do
      conn = get(conn, group_path(conn, :index, "bad-id"))
      assert redirected_to(conn) == group_path(conn, :index, default_group.slug)
    end

    test "redirects to default group when target group is private and user isn't a member",
      %{conn: conn, default_group: default_group, private_group: private_group} do
      conn = get(conn, group_path(conn, :index, private_group.slug))
      assert redirected_to(conn) == group_path(conn, :index, default_group.slug)
    end

    test "renders the page for an existing public group", %{conn: conn, public_group: public_group} do
      expected_path = group_path(conn, :index, public_group.slug)
      conn = get(conn, expected_path)
      assert html_response(conn, 200) =~ "<div id=\"root\""
      assert Phoenix.Controller.current_path(conn) == expected_path
    end
  end
end
