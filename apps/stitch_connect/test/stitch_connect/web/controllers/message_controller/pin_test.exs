defmodule StitchConnect.Web.MessageController.PinTest do
  use StitchConnect.Web.ConnCase, async: true
  import StitchConnect.Web.SubdomainRouter.Helpers

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

    {:ok, conn: conn, team: team, user: user, group: group, message: message}
  end

  test "pins a message", %{conn: conn, user: user, message: message} do
    json =
      conn
      |> post(api_v1_message_path(conn, :toggle_pin, message))
      |> json_response(200)

    assert json["pinned"] == true
    assert json["pinned_by"]["id"] == user.id
    assert json["pinned_at"] != nil
  end

  test "unpins a message", %{conn: conn, message: message} do
    Stitch.MessageAction.toggle_pin(message, message.user)

    json =
      conn
      |> post(api_v1_message_path(conn, :toggle_pin, message))
      |> json_response(200)

    assert json["pinned"] == false
    assert json["pinned_by"] == nil
    assert json["pinned_at"] == nil
  end
end
