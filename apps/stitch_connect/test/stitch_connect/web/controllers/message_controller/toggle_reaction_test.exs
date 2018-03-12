defmodule StitchConnect.Web.MessageController.ToggleReactionTest do
  use StitchConnect.Web.ConnCase, async: true
  import StitchConnect.Web.SubdomainRouter.Helpers
  import Phoenix.ChannelTest, except: [connect: 2]

  setup %{conn: conn} do
    team = insert(:team)
    user = insert(:user, team: team)
    group = insert(:group, team: team)
    message = insert(:message, group: group, user: user)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(user)
      |> with_api_user(user)

    @endpoint.subscribe("groups:id:#{group.id}")

    {:ok, conn: conn, team: team, user: user, group: group, message: message}
  end

  test "user can add reaction to the message", %{conn: conn, message: message, user: user} do
    json =
      conn
      |> put(api_v1_message_path(conn, :toggle_reaction, message), %{emoji_name: ":cat:"})
      |> json_response(200)

    assert %{"status" => "ok"} = json
    assert_broadcast "reactions_updated", %{message_id: message_id, reactions_web: reactions_web}
    assert message.id == message_id
    assert [user_id] = reactions_web[":cat:"]
    assert user_id == user.id
  end
end
