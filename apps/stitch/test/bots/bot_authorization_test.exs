defmodule Stitch.BotAuthorizationTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.BotAuthorization.can_list_bots?/2" do
    test "returns true for admins" do
      team = insert(:team)
      user = insert(:user, team_id: team.id, roles: ["admin"])
      result = Stitch.BotAuthorization.can_list_bots?(user.team_id, user.id)
      assert result == true
    end

    test "returns false for members" do
      team = insert(:team)
      user = insert(:user, team_id: team.id, roles: ["member"])
      result = Stitch.BotAuthorization.can_list_bots?(user.team_id, user.id)
      assert result == false
    end

    test "returns false for bad parameters" do
      result = Stitch.BotAuthorization.can_list_bots?(nil, "")
      assert result == false
    end
  end

  describe "Stitch.BotAuthorization.can_create_bot?/2" do
    test "returns true for admins" do
      team = insert(:team)
      user = insert(:user, team_id: team.id, roles: ["admin"])
      result = Stitch.BotAuthorization.can_create_bot?(user.team_id, user.id)
      assert result == true
    end

    test "returns false for members" do
      team = insert(:team)
      user = insert(:user, team_id: team.id, roles: ["member"])
      result = Stitch.BotAuthorization.can_create_bot?(user.team_id, user.id)
      assert result == false
    end

    test "returns false for bad parameters" do
      result = Stitch.BotAuthorization.can_create_bot?(nil, "")
      assert result == false
    end
  end

  describe "Stitch.BotAuthorization.can_edit_bot?/2" do
    test "returns true for admins" do
      team = insert(:team)
      user = insert(:user, team_id: team.id, roles: ["admin"])
      result = Stitch.BotAuthorization.can_edit_bot?(user.team_id, user.id)
      assert result == true
    end

    test "returns false for members" do
      team = insert(:team)
      user = insert(:user, team_id: team.id, roles: ["member"])
      result = Stitch.BotAuthorization.can_edit_bot?(user.team_id, user.id)
      assert result == false
    end

    test "returns false for bad parameters" do
      result = Stitch.BotAuthorization.can_edit_bot?(nil, "")
      assert result == false
    end
  end
end
