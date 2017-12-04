defmodule StitchConnect.Web.Messages.GroupMessagingTest do
  use StitchConnect.Web.FeatureCase, async: false

  import Wallaby.Query
  import Stitch.Factory
  alias StitchConnect.Web.IntegrationTestHelper, as: Helper

  defp message(msg), do: css(".message-container > .message", text: msg)

  test "users can see each other's messages" do
    team = Stitch.Team.Onboarding.create_team("Some Team Name", "someslug")
    user_1 = insert(:user, email: "someuser@somecompany.com", team: team)
    user_2 = insert(:user, email: "otheruser@somecompany.com", team: team)

    {:ok, user_1_session} = Wallaby.start_session()
    {:ok, user_2_session} = Wallaby.start_session()

    Helper.sign_in(user_1_session, team, user_1)
    Helper.sign_in(user_2_session, team, user_2)

    user_1_session
    |> click(button("Join"))
    |> fill_in(text_field("Message"), with: "hello\n")

    user_2_session
    |> click(button("Join"))
    |> fill_in(text_field("Message"), with: "world\n")

    user_1_session
    |> assert_has(message("hello"))
    |> assert_has(message("world"))

    user_2_session
    |> assert_has(message("hello"))
    |> assert_has(message("world"))
  end
end
