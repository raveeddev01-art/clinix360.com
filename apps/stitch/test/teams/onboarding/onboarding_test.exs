defmodule Stitch.Team.OnboardingTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Team.Onboarding.name_available?/1" do
    test "returns true if team name is available" do
      result = Stitch.Team.Onboarding.name_available?("Example")
      assert result == true
    end

    test "returns false if team name is not available" do
      insert(:team, %{name: "Example", slug: "example"})
      result = Stitch.Team.Onboarding.name_available?("example")
      assert result == false
    end
  end

  describe "Stitch.Team.Onboarding.create_team/1" do
    test "it creates a team given a name" do
      team = Stitch.Team.Onboarding.create_team("A Team")
      assert team.name == "A Team"
      assert team.slug == "a-team"
    end

    test "it returns an error given a name for an existing team" do
      insert(:team, %{name: "A Team", slug: "a-team"})
      {:error, message} = Stitch.Team.Onboarding.create_team("A Team")
      assert message == "Team wasn't created"
    end
  end
end