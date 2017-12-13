defmodule StitchConnect.Web.Rooms.RoomInvitesTest do
    use StitchConnect.Web.FeatureCase, async: false
  
    import Wallaby.Query, only: [button: 1, text_field: 1, css: 2]
    import Stitch.Factory
    alias StitchConnect.Web.IntegrationTestHelper, as: Helper
  
    defp message(msg), do: css(".message-container > .message", text: msg)
  
    test "user can invite another user to a room" do
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

      # TODO: Invite user to this group and verify user_2_session
      # is now invited to the group.
    end
  end
  