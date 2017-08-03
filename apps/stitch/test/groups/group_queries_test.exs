defmodule Stitch.GroupQueriesTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
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