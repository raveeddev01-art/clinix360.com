defmodule Stitch.GroupQueriesTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
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
      {:ok, users} = Stitch.GroupQueries.get_users(group.id)
      assert Enum.count(users) == 3
    end
  end

  describe "Stitch.GroupQueries.get_by_id/1" do
    test "returns group for that team with id" do
      team = insert(:team)
      group = insert(:group, %{slug: "example", team: team})
      {:ok, found_group} = Stitch.GroupQueries.get_by_id(group.id)
      assert group.id == found_group.id
    end

    test "returns error if group doesn't exist" do
      team = insert(:team)
      {:error, reason} = Stitch.GroupQueries.get_by_id(5432)
      assert reason == "Group with that id not found."
    end
  end

  describe "Stitch.GroupQueries.find_by_slug/2" do
    test "returns group for that team with slug" do
      team = insert(:team)
      user = insert(:user, %{team_id: team.id})
      group = insert(:group, %{slug: "example", team: team})
      {:ok, found_group} = Stitch.GroupQueries.find_by_slug("example", user.id)
      assert group.id == found_group.id
    end

    test "returns error if group doesn't exist" do
      team = insert(:team)
      user = insert(:user, %{team_id: team.id})
      {:error, reason} = Stitch.GroupQueries.find_by_slug("example", user.id)
      assert reason == "Group with that slug not found."
    end

    test "doesn't match groups for other teams" do
      team = insert(:team, %{name: "Goodbye", slug: "goodbye"})
      user = insert(:user, %{team_id: team.id})

      team_2 = insert(:team, %{name: "Hello", slug: "hello"})
      group = insert(:group, %{slug: "example", team: team_2})

      {:error, reason} = Stitch.GroupQueries.find_by_slug("example", user.id)
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
      groups = Stitch.GroupQueries.available_groups(user.id)
      assert Enum.count(groups) == 3
    end

    test "returns list of groups the user is participating in" do
      team = insert(:team)
      user = insert(:user, %{team_id: team.id})
      group = insert(:group, %{team: team, name: "A", slug: "a", public: false})
      group_b = insert(:group, %{team: team, name: "B", slug: "b", public: false})
      group_c = insert(:group, %{team: team, name: "C", slug: "c", public: false})
      insert(:group_user, %{user: user, group: group_b})
      insert(:group_user, %{user: user, group: group_c})

      groups = Stitch.GroupQueries.available_groups(user.id)
      assert Enum.count(groups) == 2
    end
  end

  describe "Stitch.GroupQueries.search/2" do
    test "returns list of matching groups" do
      team = insert(:team)
      user = insert(:user, %{team_id: team.id})

      insert(:group, %{team: team, name: "A bob group example", slug: "a", public: true})
      insert(:group, %{team: team, name: "Bob in the house", slug: "b", public: true})
      insert(:group, %{team: team, name: "Example", slug: "d", public: false})
      group = insert(:group, %{team: team, name: "Carebob Bob", slug: "c", public: false})
      insert(:group_user, %{user: user, group: group})

      groups = Stitch.GroupQueries.search(user.id, "bob")
      assert Enum.count(groups) == 3
    end
  end
end