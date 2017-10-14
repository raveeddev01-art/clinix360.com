defmodule StitchConnect.Web.GroupController.TogglePublicTest do
  use StitchConnect.Web.ConnCase
  import StitchConnect.Web.SubdomainRouter.Helpers

  setup %{conn: conn} do
    team = insert(:team)
    bob = insert(:user, team: team)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(bob)
      |> with_api_user(bob)

    {:ok, conn: conn, team: team, bob: bob}
  end

  test "when the user is not authorized to toggle the group's privacy setting", %{conn: conn, team: team} do
    joe = insert(:user, team: team)
    group = insert(:group, team: team, creator: joe)

    %{"message" => message} =
      conn
      |> post(api_v1_group_path(conn, :toggle_public, group), %{"public" => false})
      |> json_response(:unauthorized)

    assert message == "Not authorized to toggle the group's privacy setting."
  end

  test "can make a group public", %{conn: conn, team: team, bob: bob} do
    group = insert(:group, team: team, creator: bob, public: false)

    json =
      conn
      |> post(api_v1_group_path(conn, :toggle_public, group), %{"public" => true})
      |> json_response(200)

    assert json["public"]
    assert %{
      "joined" => _,
      "favorite" => _,
      "unread_messages_count" => _,
      "mentions_count" => _,
      "last_read_at" => _,
    } = json
  end

  test "can make a group private", %{conn: conn, team: team, bob: bob} do
    group = insert(:group, team: team, creator: bob, public: true)
    insert(:group_user, group: group, user: bob)

    json =
      conn
      |> post(api_v1_group_path(conn, :toggle_public, group), %{"public" => false})
      |> json_response(200)

    refute json["public"]
    assert %{
      "joined" => _,
      "favorite" => _,
      "unread_messages_count" => _,
      "mentions_count" => _,
      "last_read_at" => _,
    } = json
  end
end
