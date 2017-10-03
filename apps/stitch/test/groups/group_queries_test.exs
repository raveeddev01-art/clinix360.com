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
      assert reason == "Group with that id not found."
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
      assert reason == "Group with that slug not found."
    end

    test "doesn't match groups for other teams" do
      team = insert(:team, %{name: "Goodbye", slug: "goodbye"})
      user = insert(:user, %{team_id: team.id})

      team_2 = insert(:team, %{name: "Hello", slug: "hello"})
      insert(:group, %{slug: "example", team: team_2})

      {:error, reason} = GroupQueries.find_by_slug("example", user)
      assert reason == "Group with that slug not found."
    end

    test "doesn't return group if user shouldn't see it" do
      team = insert(:team)
      user = insert(:user, %{team_id: team.id})
      insert(:group, %{slug: "example", team: team, public: false})

      {:error, reason} = GroupQueries.find_by_slug("example", user)
      assert reason == "Group with that slug not found."
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

      assert {:ok, %{favorite: true}} = GroupQueries.find_by_slug("a", user.id)
      assert {:ok, %{favorite: false}} = GroupQueries.find_by_slug("b", user.id)
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

      {:ok, _message} = Stitch.Message.create(general.id, eve, %{"text_content" => "Mentions @alice, and @bob.", "type" => "chat"})
      {:ok, _message} = Stitch.Message.create(general.id, eve, %{"text_content" => "Mentions @bob second time.", "type" => "chat"})

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

  defp available_groups_indexed_by_slug(user) do
    user
    |> Stitch.GroupQueries.available_groups
    |> Enum.reduce(%{}, &Map.put(&2, &1.slug, &1))
  end
end
