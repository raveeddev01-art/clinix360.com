defmodule Stitch.Team.AdminTest do
  use ExUnit.Case, async: true
  import Stitch.Factory
  alias Stitch.Team.Admin

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Team.Admin.update_name/2" do
    test "updates name and returns OK and team struct" do
      team = insert(:team, %{name: "abc"})
      {:ok, new_team} = Admin.update_name(team.id, "def")
      assert new_team.name == "def"
    end

    test "returns error for nil and empty names" do
      team = insert(:team, %{name: "abc"})
      {:error, reason} = Admin.update_name(team.id, nil)
      assert reason == "Name cannot be blank or nil"

      {:error, reason} = Admin.update_name(team.id, "")
      assert reason == "Name cannot be blank or nil"
    end
  end

  describe "Stitch.Team.Admin.update_security_lockout_time/3" do
    test "updates security_lockout and seconds_to_lockout for team" do
      team = insert(:team, %{name: "abc"})
      {:ok, new_team} = Admin.update_security_lockout_time(team.id, true, 200)
      assert new_team.security_lockout == true
      assert new_team.seconds_to_lockout == 200
    end
  end

  describe "Stitch.Team.Admin.update_security_lockout_time/2" do
    test "updates security_lockout for team" do
      team = insert(:team, %{name: "abc"})
      {:ok, new_team} = Admin.update_security_lockout_time(team.id, false)
      assert new_team.security_lockout == false
      assert new_team.seconds_to_lockout == nil
    end
  end
end