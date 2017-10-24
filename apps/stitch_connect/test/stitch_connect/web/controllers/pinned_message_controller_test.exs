defmodule StitchConnect.Web.Api.V1.PinnedMessageControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: Routes

  test "GET /api/v1/pinned_messages", %{conn: conn} do
    team = insert(:team)
    group = insert(:group, team: team)
    user_a = insert(:user, team: team)
    user_b = insert(:user, team: team)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_api_user(user_a)

    for i <- 1..10 do
      message_1 = insert(:message, user: user_a, group: group, text_content: "#{i}")
      _message_2 = insert(:message, user: user_b, group: group, text_content: "#{i}")
      Stitch.MessageAction.toggle_pin(message_1, user_b)
    end

    result =
      conn
      |> get(Routes.api_v1_pinned_message_path(conn, :index), %{"skip" => 2, "limit" => 4, "group_id" => group.id})
      |> json_response(200)

    assert %{"data" => messages, "meta" => meta} = result
    assert %{"limit" => 4, "skip" => 2, "count" => 10} = meta

    assert Enum.count(messages) == 4
    assert Enum.map(messages, & &1["text_content"]) == ["8", "7", "6", "5"]
  end
end
