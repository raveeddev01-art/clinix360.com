defmodule StitchConnect.Web.Messages.UnreadBarTest do
  use StitchConnect.Web.FeatureCase

  import Wallaby.Query, only: [xpath: 1, button: 1, text_field: 1, css: 1]
  import Stitch.Factory
  alias StitchConnect.Web.IntegrationTestHelper, as: Helper

  @vip_room xpath("//a[@href='/rooms/vip']")
  @unread_bar css(".container-bars .unread-messages-tooltip")
  @mark_as_read_button css(".unread-messages-tooltip .mark-as-read-button")

  test "unread bar is rendered and clears after user clicks 'mark as read' button", %{metadata: metadata} do
    team = Stitch.Team.Onboarding.create_team("Some Team Name", "someslug")
    user_1 = insert(:user, email: "someuser@somecompany.com", username: "yoyoma", team: team)
    user_2 = insert(:user, email: "otheruser@somecompany.com", username: "bobby", team: team)
    vip_group = insert(:group, name: "VIP", slug: "vip", team: team, creator: user_1)
    insert(:group_user, group: vip_group, user: user_1)
    insert(:group_user, group: vip_group, user: user_2)

    {:ok, user_1_session} = Wallaby.start_session(metadata: metadata)
    {:ok, user_2_session} = Wallaby.start_session(metadata: metadata)

    Helper.sign_in(user_1_session, team, user_1)
    Helper.sign_in(user_2_session, team, user_2)

    user_1_session
    |> click(button("Join")) # to join 'general' room

    user_2_session
    |> click(button("Join")) # to join 'general' room
    |> click(@vip_room) # navigates to VIP group/room
    |> fill_in(text_field("Message"), with: "hello\n")

    user_1_session
    |> click(@vip_room) # navigates to VIP room/group
    |> assert_has(@unread_bar)
    |> click(@mark_as_read_button)
    |> refute_has(@unread_bar)
  end
end
