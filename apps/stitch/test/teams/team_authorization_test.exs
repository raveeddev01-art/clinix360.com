defmodule Stitch.TeamAuthorizationTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Team.Authorization.user_is_member?/2" do
    test "returns the team if the team id matches the user.team_id" do
      team = insert(:team)
      user = insert(:user, %{team_id: team.id})

      result = Stitch.TeamAuthorization.user_is_member?(team.id, user.id)
      assert result == true
    end

    test "returns false for non-matching team_id" do
      team = insert(:team, %{slug: "abc"})
      team_2 = insert(:team, %{slug: "def"})
      user = insert(:user, %{team_id: team_2.id})

      result = Stitch.TeamAuthorization.user_is_member?(team.id, user.id)
      assert result == false
    end
  end

  describe "Stitch.Team.Authorization.can_set_avatar?/2" do
    test "return true if user is changing its own avatar" do
      user = insert(:user, %{})

      result = Stitch.TeamAuthorization.can_set_avatar?(user, user.id)
      assert result == true
    end

    test "return false if user is trying to change someone else's avatar" do
      user1 = insert(:user, %{})
      user2 = insert(:user, %{})

      result = Stitch.TeamAuthorization.can_set_avatar?(user1, user2.id)
      assert result == false
    end

    test "return true if user is admin and trying to change someone else's avatar" do
      user1 = insert(:user, %{roles: ["admin"]})
      user2 = insert(:user, %{})

      result = Stitch.TeamAuthorization.can_set_avatar?(user1, user2.id)
      assert result == true
    end
  end
end
