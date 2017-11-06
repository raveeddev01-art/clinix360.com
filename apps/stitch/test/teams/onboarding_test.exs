defmodule Stitch.Team.OnboardingTest do
  use Stitch.DataCase, async: true
  alias Stitch.Team.Onboarding

  describe "Onboarding.slug_available?/1" do
    test "returns true if team slug is available" do
      assert Onboarding.slug_available?("example")
    end

    test "returns false if team slug is reserved word" do
      refute Onboarding.slug_available?("www")
      refute Onboarding.slug_available?("admin")
    end

    test "returns false if team name is not available" do
      insert(:team, %{name: "Care Clinic", slug: "care-clinic"})
      refute Onboarding.slug_available?("care clinic")
      refute Onboarding.slug_available?("care-clinic")
    end
  end

  describe "Onboarding.create_team/1" do
    test "it creates a team given a name and slug" do
      team = Onboarding.create_team("Care Clinic", "care-clinic-12")
      assert team.name == "Care Clinic"
      assert team.slug == "care-clinic-12"
    end

    test "it creates a room called General for the new team" do
      team = Onboarding.create_team("Care Clinic", "care-clinic-12")
      assert [%{name: "General", is_default: true}] =
        team |> Ecto.assoc(:groups) |> Repo.all
    end

    test "it returns an error given a name for an existing team" do
      insert(:team, %{name: "A Team", slug: "a-team"})
      {:error, message} = Onboarding.create_team("A new team", "a-team")
      assert message == "Team wasn't created"
    end

    test "configures the team with a trial subscription" do
      team = Onboarding.create_team("Care Clinic", "care-clinic-12")
      assert subscription = Repo.get_by(Stitch.Billing.Subscription, team_id: team.id)
      assert subscription.tier == "TRIAL"
    end
  end
end
