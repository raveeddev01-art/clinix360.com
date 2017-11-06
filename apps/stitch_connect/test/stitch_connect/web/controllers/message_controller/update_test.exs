defmodule StitchConnect.Web.MessageController.UpdateTest do
  use StitchConnect.Web.ConnCase, async: true
  import StitchConnect.Web.SubdomainRouter.Helpers
  import Phoenix.ChannelTest, except: [connect: 2]

  setup %{conn: conn} do
    team = insert(:team)
    user = insert(:user, team: team)
    group = insert(:group, team: team)
    insert(:group_user, group: group, user: user)
    message = insert(:message, user: user, group: group)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(user)
      |> with_api_user(user)

    @endpoint.subscribe("groups:#{group.slug}")

    {:ok, conn: conn, team: team, user: user, group: group, message: message}
  end

  test "user can edit his own text message", %{conn: conn, message: message} do
    json =
      conn
      |> put(api_v1_message_path(conn, :update, message), %{
        message: %{
          text_content: "new message text"
        }
      })
      |> json_response(200)

    assert_broadcast "edit_msg", message
    assert message.text_content == "new message text"

    assert json["text_content"] == "new message text"
    assert json["edited"] == true
    assert json["edited_at"] != nil
  end

  test "user can't edit other users' messages", %{conn: conn, team: team, group: group} do
    user = insert(:user, team: team)
    insert(:group_user, user: user, group: group)
    message = insert(:message, user: user, group: group)

    json = conn
      |> put(api_v1_message_path(conn, :update, message), %{
        message: %{
          text_content: "new message text"
        }
      })
      |> json_response(401)

    assert json["message"] == "You can't edit other users' messages"
  end
end
