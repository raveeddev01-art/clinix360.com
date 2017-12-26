defmodule StitchConnect.Web.Messages.DirectMessagingTest do
  use StitchConnect.Web.FeatureCase, async: true

  import Wallaby.Query, only: [button: 1, text_field: 1, css: 2]
  import Stitch.Factory
  alias StitchConnect.Web.IntegrationTestHelper, as: Helper

  defp message(msg), do: css(".message-container > .message", text: msg)

  test "user can start a direct conversation with another user", %{metadata: metadata} do
    team = Stitch.Team.Onboarding.create_team("Some Team Name", "someslug")
    user_1 = insert(:user, first_name: "John", last_name: "Doe", username: "john", team: team)
    user_2 = insert(:user, first_name: "Jane", last_name: "Doe", username: "jane", team: team)

    {:ok, user_1_session} = Wallaby.start_session(metadata: metadata)
    {:ok, user_2_session} = Wallaby.start_session(metadata: metadata)

    Helper.sign_in(user_1_session, team, user_1)
    Helper.sign_in(user_2_session, team, user_2)

    user_1_session
    |> click(css(".rooms-menu a", text: "Direct Messages"))
    |> click(css("div.team-member", text: "#{user_2.first_name} #{user_2.last_name}"))
    |> click(button("Start Conversation"))
    |> fill_in(text_field("Message"), with: "hello\n")

    user_2_session
    |> click(css(".rooms-menu a", text: "#{user_1.first_name} #{user_1.last_name}"))
    |> assert_has(message("hello"))
    |> fill_in(text_field("Message"), with: "world\n")

    user_1_session
    |> assert_has(message("world"))
  end
end
