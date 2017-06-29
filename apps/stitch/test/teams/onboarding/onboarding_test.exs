defmodule Stitch.Team.OnboardingTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Team.Onboarding.create_team/2" do
    test "creates a team given a user id and team params" do
      team = Stitch.Team.Onboarding.create_team(1, %{name: "Starbucks"})
      assert team.name == "Starbucks"
      assert team.slug == "starbucks"
    end
  end
end