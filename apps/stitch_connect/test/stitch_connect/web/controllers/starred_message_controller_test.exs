defmodule StitchConnect.Web.StarredMessageControllerTest do
  use StitchConnect.Web.ConnCase, async: true

  test "GET /api/v1/starred_messages", %{conn: conn} do
    user = insert(:user)
    message = insert(:message, user: user)
    {:ok, true, _message_action} = Stitch.MessageAction.toggle_star(message, user)

    json =
      conn
      |> subdomain(message.group.team.slug)
      |> get_as_user(user, "/api/v1/starred_messages")
      |> json_response(200)

    assert [%{
      "id" => _,
      "inserted_at" => _,
      "text_content" => _,
      "user" => %{
        "id" => _,
        "first_name" => _,
        "last_name" => _
      },
      "group_id" => _
    }] = json
  end
end
