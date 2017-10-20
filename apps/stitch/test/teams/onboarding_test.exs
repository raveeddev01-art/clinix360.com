defmodule Stitch.Team.OnboardingTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Team.Onboarding.slug_available?/1" do
    test "returns true if team slug is available" do
      result = Stitch.Team.Onboarding.slug_available?("example")
      assert result == true
    end

    test "returns false if team slug is reserved word" do
      result = Stitch.Team.Onboarding.slug_available?("www")
      assert result == false

      result = Stitch.Team.Onboarding.slug_available?("admin")
      assert result == true
    end

    test "returns false if team name is not available" do
      insert(:team, %{name: "Care Clinic", slug: "care-clinic"})
      result = Stitch.Team.Onboarding.slug_available?("care clinic")
      assert result == false

      result = Stitch.Team.Onboarding.slug_available?("care-clinic")
      assert result == false
    end
  end

  describe "Stitch.Team.Onboarding.create_team/1" do
    test "it creates a team given a name and slug" do
      team = Stitch.Team.Onboarding.create_team("Care Clinic", "care-clinic-12")
      assert team.name == "Care Clinic"
      assert team.slug == "care-clinic-12"
    end

    test "it creates a room called General for the new team" do
      team = Stitch.Team.Onboarding.create_team("Care Clinic", "care-clinic-12")
      groups = Stitch.Repo.all Ecto.assoc(team, :groups)
      assert team.name == "Care Clinic"
      assert team.slug == "care-clinic-12"
      assert Enum.count(groups) == 1
      assert Enum.at(groups, 0).name == "General"
      assert Enum.at(groups, 0).is_default
    end

    test "it returns an error given a name for an existing team" do
      insert(:team, %{name: "A Team", slug: "a-team"})
      {:error, message} = Stitch.Team.Onboarding.create_team("A new team", "a-team")
      assert message == "Team wasn't created"
    end
  end
end