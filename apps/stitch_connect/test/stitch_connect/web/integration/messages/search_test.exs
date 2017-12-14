defmodule StitchConnect.Web.Messages.SearchTest do
  use StitchConnect.Web.FeatureCase, async: false

  import Wallaby.Query, only: [button: 1, text_field: 1, css: 2]
  import Stitch.Factory
  alias StitchConnect.Web.IntegrationTestHelper, as: Helper

  defp search_result(msg), do: css(".message-search-addon .message", text: msg)

  test "user can search for messages in his team" do
    team = Stitch.Team.Onboarding.create_team("Some Team Name", "someslug")
    user_1 = insert(:user, first_name: "John", last_name: "Doe", username: "john", team: team)
    group = insert(:group, team: team)
    insert(:message, group: group, text_content: "foobar fox")

    {:ok, user_1_session} = Wallaby.start_session()

    Helper.sign_in(user_1_session, team, user_1)

    default_group = Stitch.GroupQueries.default_group(user_1)
    insert(:message, group: default_group, type: "system", text_content: "system fox")

    # Create two messages in this group with complex sentences.
    user_1_session
    |> click(button("Join"))
    |> fill_in(text_field("Message"), with: "The quick brown fox jumps over the lazy dog\n")

    user_1_session
    |> fill_in(text_field("Message"), with: "Now is the time for all good men to come to the aid of the party.\n")

    # Performn a search
    user_1_session
    |> fill_in(text_field("Search"), with: "fox")
    |> send_keys([:enter])

    # Validate result is there
    user_1_session
    |> assert_has(search_result("The quick brown fox jumps over the lazy dog"))
    |> refute_has(search_result("Now is the time for all good men to come to the aid of the party."))
    |> refute_has(search_result("foobar fox"))
    |> refute_has(search_result("system fox"))
  end
end
