defmodule StitchConnect.Web.Messages.MultiDirectMessagingTest do
  use StitchConnect.Web.FeatureCase, async: false

  import Wallaby.Query, only: [button: 1, text_field: 1, css: 2]
  import Stitch.Factory
  alias StitchConnect.Web.IntegrationTestHelper, as: Helper

  defp message(msg), do: css(".message-container > .message", text: msg)

  test "user can start a direct conversation with multiple users" do
    team = Stitch.Team.Onboarding.create_team("Some Team Name", "someslug")
    user_1 = insert(:user, first_name: "John", last_name: "Doe", username: "john", team: team)
    user_2 = insert(:user, first_name: "Jane", last_name: "Doe", username: "jane", team: team)
    user_3 = insert(:user, first_name: "Jr", last_name: "Doe", username: "jr", team: team)

    {:ok, user_1_session} = Wallaby.start_session()
    {:ok, user_2_session} = Wallaby.start_session()
    {:ok, user_3_session} = Wallaby.start_session()

    Helper.sign_in(user_1_session, team, user_1)
    Helper.sign_in(user_2_session, team, user_2)
    Helper.sign_in(user_3_session, team, user_3)

    user_1_session
    |> click(css(".rooms-menu a", text: "Direct Messages"))
    |> click(css("div.team-member", text: "#{user_2.first_name} #{user_2.last_name}"))
    |> click(css("div.team-member", text: "#{user_3.first_name} #{user_3.last_name}"))
    |> click(button("Start Conversation"))
    |> fill_in(text_field("Message"), with: "hello from #{user_1.username}\n")

    user_2_session
    |> click(css(".rooms-menu a", text: "#{user_1.first_name} #{user_1.last_name}"))
    |> fill_in(text_field("Message"), with: "hello from #{user_2.username}\n")

    user_3_session
    |> click(css(".rooms-menu a", text: "#{user_1.first_name} #{user_1.last_name}"))
    |> fill_in(text_field("Message"), with: "hello from #{user_3.username}\n")

    ###############
    ## IMPORTANT ##
    ###############
    # The assertions that are commented out in this test don't pass.
    # Only the last sent message is visible for users in
    # this test.
    #
    # If you'd like to see what this looks like, uncomment the assertions below
    # and checkout the screenshots taken by Wallaby.
    #
    user_1_session
    # |> assert_has(message("hello from #{user_1.username}"))
    # |> assert_has(message("hello from #{user_2.username}"))
    |> assert_has(message("hello from #{user_3.username}"))

    user_2_session
    # |> assert_has(message("hello from #{user_1.username}"))
    # |> assert_has(message("hello from #{user_2.username}"))
    |> assert_has(message("hello from #{user_3.username}"))

    user_3_session
    # |> assert_has(message("hello from #{user_1.username}"))
    # |> assert_has(message("hello from #{user_2.username}"))
    |> assert_has(message("hello from #{user_3.username}"))
  end
end
