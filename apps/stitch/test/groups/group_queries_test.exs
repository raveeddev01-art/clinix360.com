defmodule Stitch.GroupQueriesTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.GroupQueries.available_teams/1" do
    test "returns list of available groups for a team" do
      team = insert(:team)
      insert(:group, %{team: team, name: "A", slug: "a"})
      insert(:group, %{team: team, name: "B", slug: "b"})
      insert(:group, %{team: team, name: "C", slug: "c"})
      insert(:group, %{team: team, name: "D", slug: "d", public: false})
      user = insert(:user, %{team_id: team.id})
      groups = Stitch.GroupQueries.available_teams(user.id)
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

      groups = Stitch.GroupQueries.available_teams(user.id)
      assert Enum.count(groups) == 2
    end
  end
end