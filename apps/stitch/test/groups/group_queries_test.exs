defmodule Stitch.GroupQueriesTest do
  use Stitch.DataCase
  alias Stitch.{GroupQueries, Group, Message}

  describe "Stitch.GroupQueries.user_is_member?/2" do
    test "returns true if user is a member" do
      group = insert(:group)
      user = insert(:user)
      insert(:group_user, %{group: group, user: user})
      assert GroupQueries.user_is_member?(group.id, user.id)
    end

    test "returns false if user isn't a member" do
      group = insert(:group)
      user = insert(:user)
      refute GroupQueries.user_is_member?(group.id, user.id)
    end
  end

  describe "Stitch.GroupQueries.get_users/1" do
    test "returns collection of users" do
      group = insert(:group)
      user_a = insert(:user)
      user_b = insert(:user)
      user_c = insert(:user)
      insert(:group_user, %{group: group, user: user_a})
      insert(:group_user, %{group: group, user: user_b})
      insert(:group_user, %{group: group, user: user_c})
      {:ok, users} = GroupQueries.get_users(group.id)
      assert Enum.count(users) == 3
    end
  end

  describe "Stitch.GroupQueries.get_by_id/2" do
    test "returns group for that user's team with id" do
      team = insert(:team)
      user = insert(:user, %{team_id: team.id})
      group = insert(:group, %{slug: "example", team: team})
      {:ok, found_group} = GroupQueries.get_by_id(group.id, user)
      assert group.id == found_group.id
    end

    test "returns error if group doesn't exist" do
      user = insert(:user)
      {:error, reason} = GroupQueries.get_by_id(5432, user)
      assert reason == "Room with that id not found."
    end
  end

  describe "Stitch.GroupQueries.find_by_slug/2" do
    test "returns group for that team with slug" do
      team = insert(:team)
      user = insert(:user, %{team_id: team.id})
      group = insert(:group, %{slug: "example", team: team})
      {:ok, found_group} = GroupQueries.find_by_slug("example", user)
      assert group.id == found_group.id
    end

    test "returns error if group doesn't exist" do
      team = insert(:team)
      user = insert(:user, %{team_id: team.id})
      {:error, reason} = GroupQueries.find_by_slug("example", user)
      assert reason == "Room with that slug not found."
    end

    test "doesn't match groups for other teams" do
      team = insert(:team, %{name: "Goodbye", slug: "goodbye"})
      user = insert(:user, %{team_id: team.id})

      team_2 = insert(:team, %{name: "Hello", slug: "hello"})
      insert(:group, %{slug: "example", team: team_2})

      {:error, reason} = GroupQueries.find_by_slug("example", user)
      assert reason == "Room with that slug not found."
    end

    test "doesn't return group if user shouldn't see it" do
      team = insert(:team)
      user = insert(:user, %{team_id: team.id})
      insert(:group, %{slug: "example", team: team, public: false})

      {:error, reason} = GroupQueries.find_by_slug("example", user)
      assert reason == "Room with that slug not found."
    end
  end

  describe "Stitch.GroupQueries.available_groups/1" do
    test "returns list of available groups for a team" do
      team = insert(:team)
      insert(:group, %{team: team, name: "A", slug: "a", public: true})
      insert(:group, %{team: team, name: "B", slug: "b", public: true})
      insert(:group, %{team: team, name: "C", slug: "c", public: true})
      insert(:group, %{team: team, name: "D", slug: "d", public: false})
      user = insert(:user, %{team_id: team.id})
      groups = GroupQueries.available_groups(user.id)
      assert Enum.count(groups) == 3
    end

    test "returns list of groups the user is participating in" do
      team = insert(:team)
      user = insert(:user, %{team_id: team.id})
      insert(:group, %{team: team, name: "A", slug: "a", public: false})
      group_b = insert(:group, %{team: team, name: "B", slug: "b", public: false})
      group_c = insert(:group, %{team: team, name: "C", slug: "c", public: false})
      insert(:group_user, %{user: user, group: group_b})
      insert(:group_user, %{user: user, group: group_c})

      groups = GroupQueries.available_groups(user.id)
      assert Enum.count(groups) == 2
      assert Enum.find(groups, &( &1.slug == "b" ))
      assert Enum.find(groups, &( &1.slug == "c" ))
      refute Enum.find(groups, &( &1.slug == "a" ))
    end

    test "restricts list of groups for guest users" do
      team = insert(:team)
      _group_a = insert(:group, %{team: team, name: "A", slug: "a", public: true, is_default: true})
      group_b = insert(:group, %{team: team, name: "B", slug: "b", public: true})
      _group_c = insert(:group, %{team: team, name: "C", slug: "c", public: true})

      for role <- ["single-room-guest", "multi-room-guest"] do
        guest = insert(:user, team: team, roles: [role], groups_as_guest: [group_b.id])
        insert(:group_user, group: group_b, user: guest)
        groups = GroupQueries.available_groups(guest.id)

        assert Enum.count(groups) == 1
        assert Enum.find(groups, &( &1.slug == "b" ))
        refute Enum.find(groups, &( &1.slug == "c" ))
        refute Enum.find(groups, &( &1.slug == "a" ))
      end
    end
  end

  describe "Stitch.GroupQueries.search/2" do
    test "returns list of matching groups" do
      team = insert(:team)
      user = insert(:user, %{team_id: team.id})

      insert(:group, %{team: team, name: "A bob group example", slug: "a", public: true})
      insert(:group, %{team: team, name: "Bob in the house", slug: "b", public: false})
      insert(:group, %{team: team, name: "Example", slug: "d", public: false})
      group = insert(:group, %{team: team, name: "Carebob Bob", slug: "c", public: false})
      insert(:group_user, %{user: user, group: group})

      groups = GroupQueries.search("bob", user)
      assert Enum.count(groups) == 2
    end
  end

  describe "virtual fields" do
    test "has correct joined values set" do
      team = insert(:team)
      user = insert(:user, %{team_id: team.id})

      group = insert(:group, %{team: team, name: "Group 1", slug: "a", public: true})
      insert(:group, %{team: team, name: "Group 2", slug: "b", public: true})
      insert(:group_user, %{user: user, group: group})

      assert {:ok, %{joined: true}} = GroupQueries.find_by_slug("a", user)
      assert {:ok, %{joined: false}} = GroupQueries.find_by_slug("b", user)

      groups = GroupQueries.available_groups(user)
      assert Enum.find(groups, &( &1.slug == "a" )).joined
      refute Enum.find(groups, &( &1.slug == "b" )).joined
    end

    test "has correct favorited value set" do
      team = insert(:team)
      user = insert(:user, %{team_id: team.id})

      group1 = insert(:group, %{team: team, name: "Group 1", slug: "a", public: true})
      insert(:group_user, %{user: user, group: group1})
      insert(:group, %{team: team, name: "Group 2", slug: "b", public: true})

      Group.toggle_favorite(group1.id, user.id)

      assert {:ok, %{is_favorite: true}} = GroupQueries.find_by_slug("a", user)
      assert {:ok, %{is_favorite: false}} = GroupQueries.find_by_slug("b", user)
    end

    test "has correct unread_messages_count value set" do
      team = insert(:team)
      group = insert(:group, team: team, slug: "a")
      user_a = insert(:user, team: team)
      user_b = insert(:user, team: team)
      insert(:group_user, %{group: group, user: user_a})
      insert(:group_user, %{group: group, user: user_b})

      assert {:ok, %{unread_messages_count: 0}} = GroupQueries.find_by_slug("a", user_a)

      {:ok, %{message: _message}} = Message.create(group.id, user_b, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{unread_messages_count: 1}} = GroupQueries.find_by_slug("a", user_a)
      {:ok, %{unread_messages_count: 0}} = GroupQueries.find_by_slug("a", user_b)
    end
  end

  describe "user mentions counter" do
    test "includes mentions_count in the response" do
      team = insert(:team)
      bob = insert(:user, username: "bob", team: team)
      alice = insert(:user, username: "alice", team: team)
      eve = insert(:user, username: "eve", team: team)
      general = insert(:group, team: team, slug: "general")
      random = insert(:group, team: team, slug: "random")
      insert(:group_user, user: bob, group: general)
      insert(:group_user, user: alice, group: general)
      insert(:group_user, user: eve, group: general)
      insert(:group_user, user: alice, group: random)
      insert(:group_user, user: eve, group: random)

      {:ok, _message} = Stitch.Message.create(general.id, eve, %{"text_content" => "Mentions <@U#{alice.id}>, and <@U#{bob.id}>.", "type" => "chat"})
      {:ok, _message} = Stitch.Message.create(general.id, eve, %{"text_content" => "Mentions <@U#{bob.id}> second time.", "type" => "chat"})

      bob_groups = available_groups_indexed_by_slug(bob)
      assert bob_groups["general"].mentions_count == 2
      assert bob_groups["random"].mentions_count == nil

      alice_groups = available_groups_indexed_by_slug(alice)
      assert alice_groups["general"].mentions_count == 1
      assert alice_groups["random"].mentions_count == 0

      eve_groups = available_groups_indexed_by_slug(eve)
      assert eve_groups["general"].mentions_count == 0
      assert eve_groups["random"].mentions_count == 0
    end
  end

  describe "default_group/1" do
    test "returns the default group for a team given a user" do
      team = insert(:team)
      user = insert(:user, team: team)
      default_group = insert(:group, slug: "general", team: team, is_default: true)
      insert(:group, slug: "other1", team: team)
      insert(:group, slug: "other2", team: team)

      found_group = GroupQueries.default_group(user)
      assert default_group.id == found_group.id
    end

    test "when user is a guest and has available rooms" do
      team = insert(:team)
      group = insert(:group, team: team)
      user = insert(:user, team: team, roles: ["multi-room-guest"], groups_as_guest: [group.id])
      found_group = GroupQueries.default_group(user)
      assert group.id == found_group.id
    end

    test "creates and returns self dm when user is a guest and has no available rooms" do
      team = insert(:team)
      user = insert(:user, team: team, roles: ["multi-room-guest"], groups_as_guest: [])
      found_group = GroupQueries.default_group(user)
      assert found_group.name == "__dm_group__"
      assert found_group.slug == "__dm:#{user.id}.#{user.id}"
    end

    test "returns an existing self dm when user is a guest and has no available rooms" do
      team = insert(:team)
      user = insert(:user, team: team, roles: ["multi-room-guest"], groups_as_guest: [])
      _found_group = GroupQueries.default_group(user)
      found_group = GroupQueries.default_group(user)
      assert found_group.name == "__dm_group__"
      assert found_group.slug == "__dm:#{user.id}.#{user.id}"
    end
  end

  test "gives the first restricted group for guests" do
    team = insert(:team)
    insert(:group, team: team, is_default: true)
    group = insert(:group, team: team)

    for role <- ["single-room-guest", "multi-room-guest"] do
      guest = insert(:user, team: team, roles: [role], groups_as_guest: [group.id])
      insert(:group_user, group: group, user: guest)

      assert GroupQueries.default_group(guest).id == group.id
    end
  end

  describe "non_dm_group_memberships/1" do
    setup do
      team = insert(:team)
      user = insert(:user, team: team)
      {:ok, user: user, team: team}
    end

    test "returns the list of memberships", %{user: user, team: team} do
      group = insert(:group, team: team)
      group_user = insert(:group_user, group: group, user: user)
      insert(:group_user, group: group)

      assert [result] = GroupQueries.non_dm_group_memberships(user)
      assert result.id == group_user.id
    end

    test "excludes DMs", %{user: user, team: team} do
      other_user = insert(:user, team: team)
      Stitch.Group.create_single_dm(user, [user.id, other_user.id])
      Stitch.Group.create_multi_dm(user, [user.id, other_user.id])
      assert [] == GroupQueries.non_dm_group_memberships(user)
    end
  end

  describe "valid_guest_direct_message?" do
    test "returns true when params are valid" do
      team = insert(:team)
      group = insert(:group, team: team)
      user = insert(:user, team: team)
      guest = insert(:user, team: team, roles: ["single-room-guest"], groups_as_guest: [group.id])
      insert(:group_user, user: user, group: group)
      insert(:group_user, user: guest, group: group)

      assert GroupQueries.valid_guest_direct_message?(guest.groups_as_guest, [user.id, guest.id])
    end

    test "returns false when params are invalid" do
      team = insert(:team)
      group = insert(:group, team: team)
      other_group = insert(:group, team: team)
      user = insert(:user, team: team)
      invalid_user = insert(:user, team: team)
      guest = insert(:user, team: team, roles: ["single-room-guest"], groups_as_guest: [group.id])
      insert(:group_user, user: user, group: group)
      insert(:group_user, user: guest, group: group)
      insert(:group_user, user: invalid_user, group: other_group)
      refute GroupQueries.valid_guest_direct_message?(guest.groups_as_guest, [user.id, guest.id, invalid_user.id])
    end
  end

  defp available_groups_indexed_by_slug(user) do
    user
    |> Stitch.GroupQueries.available_groups
    |> Enum.reduce(%{}, &Map.put(&2, &1.slug, &1))
  end
end
