defmodule Stitch.Team.OnboardingTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Team.Onboarding.create_team/2" do
    test "creates a team given a user id and team params" do
      user = insert(:user, %{email: "example@email.com"})
      team = Stitch.Team.Onboarding.create_team(user.id, %{name: "Starbucks"})
      assert team.name == "Starbucks"
      assert team.slug == "starbucks"

      # Check that the user who created the Team is made an admin.
      new_team = Stitch.Repo.get(Stitch.Team, team.id)
      team_users = Stitch.Repo.all(Ecto.assoc(new_team, :users))
      assert Enum.count(team_users) == 1
    end

    test "returns error for existing team name" do
      insert(:team, %{name: "Starbucks", slug: "starbucks"})
      {:error, message} = Stitch.Team.Onboarding.create_team(1, %{name: "Starbucks"})
      assert message == "Team already exists with this name."
    end
  end
end