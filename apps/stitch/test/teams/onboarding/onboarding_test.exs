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
      team = insert(:team, %{name: "Example", slug: "example"})
      result = Stitch.Team.Onboarding.name_available?("example")
      assert result == false
    end
  end
end