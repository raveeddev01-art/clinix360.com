defmodule Stitch.TeamQueriesTest do
  use Stitch.DataCase, async: true
  import Stitch.Factory
  alias Stitch.TeamQueries

  describe "Stitch.TeamQueries.get_by_slug/1" do
    test "finds a team given a slug string" do
      insert(:team, %{name: "Example", slug: "example"})
      team = TeamQueries.get_by_slug("example")
      assert team.name == "Example"
      assert team.slug == "example"
    end

    test "returns nil if empty slug is passed" do
      team = TeamQueries.get_by_slug("")
      assert team == nil
    end
  end

  describe "list_active_users/1" do
    setup do
      team = insert(:team)
      active_users =
        for _ <- 1..4 do
          user = insert(:user, team: team, onboarded: true)
          clear_assoc(user, :team)
        end

      {:ok, team: team, active_users: active_users}
    end

    test "lists active users", %{team: team, active_users: active_users} do
      insert(:user, team: team, onboarded: true, disabled: true)
      insert(:user, team: team, onboarded: true, disabled: true)
      insert(:user, team: team, onboarded: false, disabled: false)
      assert TeamQueries.list_active_users(team) == active_users
    end

    test "doesn't list disabled users", %{team: team} do
      disabled_user = insert(:user, team: team, onboarded: true, disabled: true)
      users = TeamQueries.list_active_users(team)
      refute Enum.any?(users, &(&1.id == disabled_user.id))
    end

    test "doesn't list users that haven't completed onboarding", %{team: team} do
      non_onboarded_user = insert(:user, team: team, onboarded: false, disabled: false)
      users = TeamQueries.list_active_users(team)
      refute Enum.any?(users, &(&1.id == non_onboarded_user.id))
    end
  end
end
