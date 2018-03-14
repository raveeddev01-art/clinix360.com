defmodule StitchConnect.Web.MessageController.DeleteMessageLinkPreviewTest do
  use StitchConnect.Web.ConnCase, async: true
  import StitchConnect.Web.SubdomainRouter.Helpers
  import Phoenix.ChannelTest, except: [connect: 2]

  setup %{conn: conn} do
    team = insert(:team)
    user = insert(:user, team: team)
    group = insert(:group, team: team)
    link = "http://example.com"
    message = insert(:message, group: group, user: user, link_previews: [
      %{link: link, title: "Example"},
    ])

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(user)
      |> with_api_user(user)

    @endpoint.subscribe("groups:id:#{group.id}")

    {:ok, conn: conn, team: team, user: user, group: group, message: message, link: link}
  end

  test "user can delete message link preview belonging to his own message", %{conn: conn, message: message, link: link} do
    json =
      conn
      |> put(api_v1_message_path(conn, :delete_message_link_preview, message), %{link: link})
      |> json_response(200)

    assert %{"status" => "ok"} = json
    assert_broadcast "msg_link_preview_deleted", %{message_id: message_id, link: ^link}
    assert message.id == message_id
  end
end
