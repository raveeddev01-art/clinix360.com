defmodule StitchConnect.Web.Messages.MentionedNotificationTest do
  use StitchConnect.Web.FeatureCase, async: true

  import Wallaby.Query, only: [xpath: 1, xpath: 2, button: 1, text_field: 1, css: 1, css: 2]
  import Stitch.Factory
  alias StitchConnect.Web.IntegrationTestHelper, as: Helper

  @moduletag timeout: :timer.minutes(2)

  @vip_room xpath("//a[@href='/rooms/vip']")
  @mark_as_read_button css(".unread-messages-tooltip .mark-as-read-button")
  @rooms_menu_notification xpath("//a[@href='/rooms/vip']", text: "VIP\n1")
  @sidebar_notification css(".switcher .switcher__link .switcher__badge", text: "1")

  test "notification badge is rendered with right number when user is mentioned", %{metadata: metadata} do
    team = Stitch.Team.Onboarding.create_team("Some Team Name", "someslug")
    user_1_attrs = [
      email: "someuser@somecompany.com",
      username: "yoyoma",
      team: team
    ]
    user_2_attrs = [
      email: "otheruser@somecompany.com",
      username: "bobby",
      team: team
    ]
    user_1 = insert(:user, user_1_attrs)
    user_2 = insert(:user, user_2_attrs)
    vip_group = insert(:group, name: "VIP", slug: "vip", team: team, creator: user_1)
    insert(:group_user, group: vip_group, user: user_1)
    insert(:group_user, group: vip_group, user: user_2)

    {:ok, user_1_session} = Wallaby.start_session(metadata: metadata)
    {:ok, user_2_session} = Wallaby.start_session(metadata: metadata)

    Helper.sign_in(user_1_session, team, user_1)
    Helper.sign_in(user_2_session, team, user_2)

    user_1_session
    |> click(button("Join"))

    user_2_session
    |> click(button("Join"))
    |> click(@vip_room)
    |> fill_in(text_field("Message"), with: "@yoyoma hello\n")

    user_1_session
    |> assert_has(@rooms_menu_notification)
    |> assert_has(@sidebar_notification)

    # mention notification should disappear after user visits room
    user_1_session
    |> click(@vip_room)
    # Clicking on the 'mark as read' button below is needed for the mention
    # notification to disappear. This is not ideal as it's not the behavior we
    # expect. We would like mention notifications to disappear on their own
    # after the user visits the room.
    |> click(@mark_as_read_button)
    |> refute_has(@rooms_menu_notification)
    |> refute_has(@sidebar_notification)
  end

  test "notification badge doesn't render if user is already in the room", %{metadata: metadata} do
    team = Stitch.Team.Onboarding.create_team("Some Team Name", "someslug")
    user_1_attrs = [
      email: "someuser@somecompany.com",
      username: "yoyoma",
      team: team
    ]
    user_2_attrs = [
      email: "otheruser@somecompany.com",
      username: "bobby",
      team: team
    ]
    user_1 = insert(:user, user_1_attrs)
    user_2 = insert(:user, user_2_attrs)
    vip_group = insert(:group, name: "VIP", slug: "vip", team: team, creator: user_1)
    insert(:group_user, group: vip_group, user: user_1)
    insert(:group_user, group: vip_group, user: user_2)
    # As of this writing this test will fail unless we add a few messages per
    # user. That's why we add these 4 messages per user.
    for _ <- 1..4 do
      insert(:message, user: user_1, group: vip_group)
      insert(:message, user: user_2, group: vip_group)
    end

    {:ok, user_1_session} = Wallaby.start_session(metadata: metadata)
    {:ok, user_2_session} = Wallaby.start_session(metadata: metadata)

    Helper.sign_in(user_1_session, team, user_1)
    Helper.sign_in(user_2_session, team, user_2)

    user_1_session
    |> click(button("Join"))
    |> click(@vip_room)

    user_2_session
    |> click(button("Join"))
    |> click(@vip_room)
    |> fill_in(text_field("Message"), with: "@yoyoma hello\n")

    user_1_session
    |> refute_has(@rooms_menu_notification)
    |> refute_has(@sidebar_notification)
  end
end
