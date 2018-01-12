defmodule StitchConnect.Web.MessageController.DeleteTest do
  use StitchConnect.Web.ConnCase, async: false
  import StitchConnect.Web.SubdomainRouter.Helpers
  import Phoenix.ChannelTest, except: [connect: 2]

  setup %{conn: conn} do
    team = insert(:team)
    user = insert(:user, team: team)
    user_b = insert(:user, team: team)
    group = insert(:group, team: team)
    insert(:group_user, group: group, user: user)
    insert(:group_user, group: group, user: user_b)
    message = insert(:message, user: user, group: group)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(user)
      |> with_api_user(user)

    @endpoint.subscribe("groups:#{group.slug}")
    @endpoint.subscribe("events:#{user_b.id}")

    {:ok, conn: conn, team: team, user: user, group: group, message: message}
  end

  test "user can delete his own text message", %{conn: conn, message: message} do
    conn
    |> delete(api_v1_message_path(conn, :delete, message))
    |> response(204)

    assert_broadcast "delete_msg", %{id: message_id_1}
    assert_broadcast "message_deleted", %{id: message_id_2}

    assert message.id == message_id_1
    assert message.id == message_id_2

    assert Stitch.MessageQueries.get_by_id(message.id) == nil
  end

  test "user can't delete other users' messages", %{conn: conn, team: team, group: group} do
    user = insert(:user, team: team)
    message = insert(:message, user: user, group: group)

    json =
      conn
      |> delete(api_v1_message_path(conn, :delete, message))
      |> json_response(401)

    refute_broadcast "delete_msg", %{}
    refute_broadcast "message_deleted", %{}

    assert json["message"] == "You can't delete other users' messages"
    refute Stitch.MessageQueries.get_by_id(message.id) == nil
  end
end
