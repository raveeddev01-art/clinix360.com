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
  end
end