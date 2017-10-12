defmodule StitchConnect.Web.GroupController.IndexTest do
  use StitchConnect.Web.ConnCase
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "name and type" do
    setup %{conn: conn} do
      team = insert(:team)
      bob = insert(:user, team: team, first_name: "Bob")
      joe = insert(:user, team: team, first_name: "Joe", last_name: "Schmo")

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_user_session(bob)
        |> with_api_user(bob)

      {:ok, conn: conn, team: team, bob: bob, joe: joe}
    end

    test "for regular groups", %{conn: conn, team: team} do
      group = insert(:group, team: team)

      json =
        conn
        |> get(api_v1_group_path(conn, :index), %{slug: group.slug})
        |> json_response(200)

      assert json["type"] == "regular"
      assert json["name"] == group.name
    end

    test "for single DMs", %{conn: conn, bob: bob, joe: joe} do
      %{"slug" => slug} =
        conn
        |> post(api_v1_group_path(conn, :create_single_dm), %{"user_ids" => [bob.id, joe.id]})
        |> json_response(200)

      json =
        conn
        |> get(api_v1_group_path(conn, :index), %{slug: slug})
        |> json_response(200)

      assert json["type"] == "dm"
      assert json["name"] == "Joe Schmo"
    end

    test "for multi DMs", %{conn: conn, team: team, bob: bob, joe: joe} do
      tim = insert(:user, team: team, first_name: "Tim")

      %{"slug" => slug} =
        conn
        |> post(api_v1_group_path(conn, :create_multi_dm), %{"user_ids" => [bob.id, joe.id, tim.id]})
        |> json_response(200)

      json =
        conn
        |> get(api_v1_group_path(conn, :index), %{slug: slug})
        |> json_response(200)

      assert json["name"] == "Joe, Tim"
    end
  end

  describe "redirects" do
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
