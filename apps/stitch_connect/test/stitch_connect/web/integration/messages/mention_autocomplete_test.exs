defmodule StitchConnect.Web.Messages.MentionAutocompleteTest do
  use StitchConnect.Web.FeatureCase, async: true

  import Wallaby.Query
  import Stitch.Factory
  alias StitchConnect.Web.IntegrationTestHelper, as: Helper

  defp mention_item(username), do: css(".user-mention-menu span", text: username)

  test "user can see auotcomplete menu when he types @ character" do
    team = Stitch.Team.Onboarding.create_team("Some Team Name", "someslug")
    group = insert(:group, team: team)
    user_1 = insert(:user, first_name: "Anton", last_name: "A", username: "anton", team: team)
    user_2 = insert(:user, first_name: "Anthony", last_name: "B", username: "anthony", team: team)
    user_3 = insert(:user, first_name: "John", last_name: "Doe", username: "john", team: team)

    # Login as user_3 and verify you can mention Anton and Anthony.
    {:ok, user_3_session} = Wallaby.start_session(metadata: metadata)
    Helper.sign_in(user_3_session, team, user_3)

    # Type the @ symbol, is the autocomplete menu there?
    user_3_session
    |> fill_in(text_field("Message"), with: "@")

    user_3_session
    |> assert_has(mention_item("Anton A"))
    |> assert_has(mention_item("Anthony B"))
    |> refute_has(mention_item("John Doe"))
  end
end
  