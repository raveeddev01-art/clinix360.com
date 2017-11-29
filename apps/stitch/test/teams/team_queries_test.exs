defmodule Stitch.TeamQueriesTest do
  use Stitch.DataCase, async: true
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
      users = TeamQueries.list_active_users(team)
      user_ids = users |> Enum.map(& &1.id) |> Enum.sort
      assert user_ids == active_users |> Enum.map(& &1.id) |> Enum.sort
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

  describe "get_team_owner/1" do
    test "returns the owner" do
      team = insert(:team)
      owner = insert(:user, team: team, roles: ["admin"])
      insert(:user, team: team, roles: ["admin"])
      insert(:user, team: team)

      assert TeamQueries.get_team_owner(team) == clear_assoc(owner, :team)
    end
  end

  describe "all_with_user_email/1" do
    test "returns all teams having a user with the given email" do
      team_1 = insert(:team)
      team_2 = insert(:team)
      team_3 = insert(:team)
      insert(:user, team: team_1, email: "foo@example.com")
      insert(:user, team: team_2, email: "foo@example.com")
      insert(:user, team: team_3, email: "bar@example.com")

      teams = TeamQueries.all_with_user_email("foo@example.com")

      assert length(teams) == 2
      assert team_1 in teams
      assert team_2 in teams
      refute team_3 in teams
    end

    test "returns an empty list if no team has a user with the given email" do
      assert TeamQueries.all_with_user_email("foo@example.com") == []
    end
  end

  test "list_teams/0" do
    insert(:team)
    insert(:team)
    insert(:team)
    teams = TeamQueries.list_teams()
    assert length(teams) == 3
    assert Enum.all?(teams, &(&1.__struct__ == Stitch.Team))
  end
end
