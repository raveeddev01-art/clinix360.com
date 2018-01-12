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

    repeat_till(fn ->
      assert has_room?(session, "Rooms", "Emergency Room")
      refute has_room?(session, "Favorites", "Emergency Room")
    end)

    favorite(session, "Emergency Room")

    repeat_till(fn ->
      refute has_room?(session, "Rooms", "Emergency Room")
      assert has_room?(session, "Favorites", "Emergency Room")
    end)

    unfavorite(session, "Emergency Room")

    repeat_till(fn ->
      assert has_room?(session, "Rooms", "Emergency Room")
      refute has_room?(session, "Favorites", "Emergency Room")

      assert has_room?(session, "Rooms", "Investors")
      refute has_room?(session, "Favorites", "Investors")
    end)

    favorite(session, "Investors")

    repeat_till(fn ->
      refute has_room?(session, "Rooms", "Investors")
      assert has_room?(session, "Favorites", "Investors")
    end)

    unfavorite(session, "Investors")

    repeat_till(fn ->
      assert has_room?(session, "Rooms", "Investors")
      refute has_room?(session, "Favorites", "Investors")

      assert has_room?(session, "Direct Messages", "Joe Cox")
      refute has_room?(session, "Favorites", "Joe Cox")
    end)

    favorite(session, "Joe Cox")

    repeat_till(fn ->
      refute has_room?(session, "Direct Messages", "Joe Cox")
      assert has_room?(session, "Favorites", "Joe Cox")
    end)

    unfavorite(session, "Joe Cox")

    repeat_till(fn ->
      assert has_room?(session, "Direct Messages", "Joe Cox")
      refute has_room?(session, "Favorites", "Joe Cox")
    
      assert has_room?(session, "Direct Messages", "Sam Hay, Tim Fox")
      refute has_room?(session, "Favorites", "Sam Hay, Tim Fox")
    end)

    favorite(session, "Sam Hay, Tim Fox")

    repeat_till(fn ->
      refute has_room?(session, "Direct Messages", "Sam Hay, Tim Fox")
      assert has_room?(session, "Favorites", "Sam Hay, Tim Fox")
    end)

    unfavorite(session, "Sam Hay, Tim Fox")

    repeat_till(fn ->
      assert has_room?(session, "Direct Messages", "Sam Hay, Tim Fox")
      refute has_room?(session, "Favorites", "Sam Hay, Tim Fox")
    end)
  end

  defp has_room?(session, room_menu, room) do
    css = css(".rooms-menu .menu-nav", text: room_menu)
    has?(session, css) && session |> find(css) |> has_text?(room)
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
