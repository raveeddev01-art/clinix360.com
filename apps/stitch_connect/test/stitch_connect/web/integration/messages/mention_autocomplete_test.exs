defmodule StitchConnect.Web.Messages.MentionAutocompleteTest do
  use StitchConnect.Web.FeatureCase

  import Wallaby.Query
  import Stitch.Factory
  alias StitchConnect.Web.IntegrationTestHelper, as: Helper

  defp mention_item(username), do: css(".user-mention-menu .item-text span", count: 1, text: username)
  defp selected_mention_item(username), do: css(".user-mention-menu .active .item-text span", count: 1, text: username)

  test "user can see auotcomplete menu when he types @ character", %{metadata: metadata} do
    team = Stitch.Team.Onboarding.create_team("Some Team Name", "someslug")
    _group = insert(:group, team: team)
    _user_1 = insert(:user, first_name: "Anton", last_name: "A", username: "anton", team: team)
    _user_2 = insert(:user, first_name: "Anthony", last_name: "B", username: "anthony", team: team)
    user_3 = insert(:user, first_name: "John", last_name: "Doe", username: "john", team: team)

    # Login as user_3 and verify you can mention Anton and Anthony.
    {:ok, user_3_session} = Wallaby.start_session(metadata: metadata)
    Helper.sign_in(user_3_session, team, user_3)

    # Type the @ symbol, is the autocomplete menu there?
    user_3_session
    |> click(button("Join"))
    |> fill_in(text_field("Message"), with: "@")
    |> assert_has(css(".user-mention-menu"))
  end

  test "mentions list gets smaller as the user types more characters", %{metadata: metadata} do
    team = Stitch.Team.Onboarding.create_team("Some Team Name", "someslug")
    _group = insert(:group, team: team)
    _user_1 = insert(:user, first_name: "Anton", last_name: "A", username: "anton", team: team)
    _user_2 = insert(:user, first_name: "Anthony", last_name: "B", username: "anthony", team: team)
    user_3 = insert(:user, first_name: "John", last_name: "Doe", username: "john", team: team)

    # Login as user_3 and verify you can mention Anton and Anthony.
    {:ok, user_3_session} = Wallaby.start_session(metadata: metadata)
    Helper.sign_in(user_3_session, team, user_3)

    # Type the @ symbol, is the autocomplete menu there?
    user_3_session
    |> click(button("Join"))
    |> fill_in(text_field("Message"), with: "@ant")
    |> assert_has(mention_item("Anton A"))
    |> assert_has(mention_item("Anthony B"))
    |> refute_has(mention_item("John Doe"))
  end

  test "user can navigate mentions list with keyboard", %{metadata: metadata} do
    team = Stitch.Team.Onboarding.create_team("Some Team Name", "someslug")
    _group = insert(:group, team: team)
    _user_1 = insert(:user, first_name: "Anton", last_name: "A", username: "anton", team: team)
    _user_2 = insert(:user, first_name: "Anthony", last_name: "B", username: "anthony", team: team)
    user_3 = insert(:user, first_name: "John", last_name: "Doe", username: "john", team: team)

    # Login as user_3.
    {:ok, user_3_session} = Wallaby.start_session(metadata: metadata)
    Helper.sign_in(user_3_session, team, user_3)

    # Can the user use the keyboard to navigate down and
    # autocomplete a mention to the second user in the menu?
    user_3_session
    |> click(button("Join"))
    |> fill_in(text_field("Message"), with: "@ant")
    |> send_keys([:down_arrow])
    |> assert_has(selected_mention_item("Anthony B"))
    |> send_keys([:enter])
    |> assert_has(css(".message-text", text: "@anthony"))
  end
end
