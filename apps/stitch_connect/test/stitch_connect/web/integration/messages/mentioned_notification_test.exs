defmodule StitchConnect.Web.Messages.MentionedNotificationTest do
  use StitchConnect.Web.FeatureCase, async: false

  import Wallaby.Query, only: [xpath: 1, xpath: 2, button: 1, text_field: 1, css: 2]
  import Stitch.Factory
  alias StitchConnect.Web.IntegrationTestHelper, as: Helper

  test "notification badge is rendered with right number when user is mentioned" do
    team = Stitch.Team.Onboarding.create_team("Some Team Name", "someslug")
    user_1 = insert(:user, email: "someuser@somecompany.com", username: "yoyoma", team: team)
    user_2 = insert(:user, email: "otheruser@somecompany.com", username: "bobby", team: team)
    vip_group = insert(:group, name: "VIP", slug: "vip", team: team, creator: user_1)
    insert(:group_user, group: vip_group, user: user_1)
    insert(:group_user, group: vip_group, user: user_2)

    {:ok, user_1_session} = Wallaby.start_session()
    {:ok, user_2_session} = Wallaby.start_session()

    Helper.sign_in(user_1_session, team, user_1)
    Helper.sign_in(user_2_session, team, user_2)

    user_1_session
    |> click(button("Join"))
    |> click(xpath("//a[@href='/rooms/vip']")) # navigates to VIP group/room

    user_2_session
    |> click(button("Join"))
    |> click(xpath("//a[@href='/rooms/vip']")) # navigates to VIP group/room
    |> fill_in(text_field("Message"), with: "@yoyoma hello\n")

    user_1_session
    |> assert_has(xpath("//a[@href='/rooms/vip']", text: "VIP\n1")) # rooms menu
    |> assert_has(css(".switcher .switcher__link .switcher__badge", text: "1")) # switcher
    # the '1' on the two lines above represents a mention notification

    # mention notification disappears after user visits group/channel
    user_1_session
    |> click(xpath("//a[@href='/rooms/vip']")) # navigates to VIP group/room
    |> assert_has(xpath("//a[@href='/rooms/vip']", text: "VIP")) # assert '1' is gone
    |> assert_has(css(".switcher .switcher__link .switcher__badge", text: "1")) # refute notification badge
  end
end
