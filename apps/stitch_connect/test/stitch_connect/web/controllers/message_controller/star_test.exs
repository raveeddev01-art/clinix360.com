defmodule StitchConnect.Web.MessageController.StarTest do
  use StitchConnect.Web.ConnCase, async: true
  import Phoenix.ChannelTest, except: [connect: 2]
  import StitchConnect.Web.SubdomainRouter.Helpers

  setup %{conn: conn} do
    team = insert(:team)
    user = insert(:user, team: team)
    group = insert(:group, team: team)
    message = insert(:message, user: user, group: group)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(user)
      |> with_api_user(user)

    {:ok, _socket} = connect_socket(%{user1: user})
    @endpoint.subscribe("groups:#{group.slug}")

    {:ok, conn: conn, team: team, user: user, group: group, message: message}
  end

  test "stars a message", %{conn: conn, message: message} do
    json =
      conn
      |> post(api_v1_message_path(conn, :toggle_star, message))
      |> json_response(200)

    assert json["starred"] == true

    assert_broadcast "starred_message", %{id: message_id, starred: true}
    assert message_id == message.id
  end

  test "unstars a message", %{conn: conn, message: message} do
    Stitch.MessageAction.toggle_star(message, message.user)

    json =
      conn
      |> post(api_v1_message_path(conn, :toggle_star, message))
      |> json_response(200)

    assert json["starred"] == false

    assert_broadcast "starred_message", %{id: message_id, starred: false}
    assert message_id == message.id
  end
end
