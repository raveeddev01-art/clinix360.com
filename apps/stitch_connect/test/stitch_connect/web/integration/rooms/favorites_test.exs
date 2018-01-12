defmodule StitchConnect.Web.Rooms.FavoritesTest do
  use StitchConnect.Web.FeatureCase

  test "favorite/unfavorite rooms and direct messages", %{metadata: metadata} do
    team = Stitch.Team.Onboarding.create_team("Care Clinic", "care-clinic")
    bob = insert(:user, team: team, username: "bob", first_name: "Bob", last_name: "Lee")
    joe = insert(:user, team: team, username: "joe", first_name: "Joe", last_name: "Cox")
    sam = insert(:user, team: team, username: "sam", first_name: "Sam", last_name: "Hay")
    tim = insert(:user, team: team, username: "tim", first_name: "Tim", last_name: "Fox")
    public_group = insert(:group, team: team, name: "Emergency Room", slug: "emergency-room", creator: bob)
    private_group = insert(:group, team: team, name: "Investors", slug: "investors", creator: bob, public: false)
    insert(:group_user, group: public_group, user: bob)
    insert(:group_user, group: private_group, user: bob)
    Stitch.Group.create_single_dm(bob, [bob.id, joe.id])
    Stitch.Group.create_multi_dm(bob, [bob.id, sam.id, tim.id])

    {:ok, session} = Wallaby.start_session(metadata: metadata)
    sign_in(session, team, bob)

    # Favoriting a public room.
    favorite(session, "Emergency Room")

    session
    |> assert_has(css(".favorite-rooms .item-text", text: "Emergency Room"))
    |> refute_has(css(".favorite-rooms .item-text", text: "Investors"))


    # Favoriting a private room.
    unfavorite(session, "Emergency Room")
    favorite(session, "Investors")

    session
    |> assert_has(css(".favorite-rooms .item-text", text: "Investors"))
    |> refute_has(css(".favorite-rooms .item-text", text: "Emergency Room"))

    # Favoriting single DM.
    favorite(session, "Joe Cox")

    session
    |> assert_has(css(".favorite-rooms .item-text", text: "Joe Cox"))

    # Favoriting multi DMs.
    favorite(session, "Sam Hay, Tim Fox")

    session
    |> assert_has(css(".favorite-rooms .item-text", text: "Sam Hay, Tim Fox"))
  end

  defp favorite(session, room) do
    session
    |> click(css(".item-text", text: room))
    |> click(css("#dropdown-room-controls"))
    |> click(link("Favorite"))
  end

  defp unfavorite(session, room) do
    session
    |> click(css(".item-text", text: room))
    |> click(css("#dropdown-room-controls"))
    |> click(link("Unfavorite"))
  end
end
