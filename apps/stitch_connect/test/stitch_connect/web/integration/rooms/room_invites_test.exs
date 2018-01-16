defmodule StitchConnect.Web.Rooms.RoomInvitesTest do
    use StitchConnect.Web.FeatureCase

    test "user can invite another user to a room", %{metadata: metadata} do
      team = Stitch.Team.Onboarding.create_team("Some Team Name", "someslug")
      user_1 = insert(:user, email: "someuser@somecompany.com", team: team)
      user_2 = insert(:user, email: "otheruser@somecompany.com", team: team, first_name: "Bob", last_name: "Banks")
      public_group = insert(:group, team: team, name: "Emergency Room", slug: "emergency-room", creator: user_1)
      private_group = insert(:group, team: team, name: "Investors", slug: "investors", creator: user_1, public: false)
      insert(:group_user, group: public_group, user: user_1)
      insert(:group_user, group: private_group, user: user_1)

      {:ok, user_1_session} = Wallaby.start_session(metadata: metadata)
      {:ok, user_2_session} = Wallaby.start_session(metadata: metadata)

      sign_in(user_1_session, team, user_1)
      sign_in(user_2_session, team, user_2)

      user_2_session
      |> refute_has(sidemenu_item("Emergency Room"))
      |> refute_has(sidemenu_item("Investors"))

      user_1_session
      |> click(sidemenu_item("Emergency Room"))
      |> click(css("#dropdown-room-controls"))
      |> click(link("Invite"))
      |> assert_has(css(".team-member", text: "Bob Banks"))
      |> repeat_till(fn session -> # adding user fails during modal fade in animation
          session
          |> click(css(".team-member", text: "Bob Banks"))
          |> has?(css(".Select--multi.has-value"))
        end)
      |> click(button("Invite"))

      user_2_session
      |> click(sidemenu_item("Emergency Room"))
      |> assert_has(css(".system-message", text: "Bob Banks joined the room at"))

      user_1_session
      |> click(sidemenu_item("Investors"))
      |> click(css("#dropdown-room-controls"))
      |> click(link("Invite"))
      |> repeat_till(fn session ->
          session
          |> click(css(".team-member", text: "Bob Banks"))
          |> has?(css(".Select--multi.has-value"))
        end)
      |> click(button("Invite"))

      user_2_session
      |> click(sidemenu_item("Investors"))
      |> assert_has(css(".system-message", text: "Bob Banks joined the room at"))
    end

    defp sidemenu_item(text), do: css("div.item-text", text: text)
  end

