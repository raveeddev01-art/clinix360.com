defmodule Stitch.Team.AuthorizationTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Team.Authorization.user_is_member?/2" do
    test "returns the team if the team id matches the user.team_id" do
      team = insert(:team)
      user = insert(:user, %{team_id: team.id})

      team = Stitch.Team.Authorization.user_is_member?(team.id, user.id)
      assert team != nil
      assert user.team_id == team.id
    end

    test "returns false for non-matching team_id" do
      team = insert(:team, %{slug: "abc"})
      team_2 = insert(:team, %{slug: "def"})
      user = insert(:user, %{team_id: team_2.id})

      result = Stitch.Team.Authorization.user_is_member?(team.id, user.id)
      assert result == false
    end
  end
end
