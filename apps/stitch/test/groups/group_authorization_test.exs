defmodule Stitch.GroupAuthorizationTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.GroupAuthorization.can_view?/2" do
    test "returns true public groups" do
      user = insert(:user)
      group = insert(:group, team: user.team)
      result = Stitch.GroupAuthorization.can_view?(group, user)
      assert result == true
    end

    test "return true for groups he belongs to" do
      user = insert(:user)
      group = insert(:group, team: user.team)
      insert(:group_user, %{user: user, group: group})
      result = Stitch.GroupAuthorization.can_view?(group, user)
      assert result == true
    end

    test "returns true for admin user" do
      user = insert(:user, %{roles: ["admin"]})
      group = insert(:group, team: user.team)
      result = Stitch.GroupAuthorization.can_view?(group, user)
      assert result == true
    end

    test "returns false for private groups he doesn't belong to" do
      user = insert(:user)
      group = insert(:group, team: user.team, public: false)
      result = Stitch.GroupAuthorization.can_view?(group, user)
      assert result == false
    end

    test "returns false for public groups belinging to another team" do
      user = insert(:user)
      group = insert(:group, public: true)
      result = Stitch.GroupAuthorization.can_view?(group, user)
      assert result == false
    end
  end

  describe "Stitch.GroupAuthorization.is_member?2" do
    test "returns true if user is member" do
      user = insert(:user)
      group = insert(:group, team: user.team)
      insert(:group_user, %{user: user, group: group})
      result = Stitch.GroupAuthorization.is_member?(group.id, user.id)
      assert result == true
    end

    test "returns false if user isn't member" do
      user = insert(:user)
      group = insert(:group, team: user.team)
      result = Stitch.GroupAuthorization.is_member?(group.id, user.id)
      assert result == false
    end
  end

  describe "Stitch.GroupAuthorization.can_invite?/2" do
    test "returns true for admin users" do
      user = insert(:user, %{roles: ["admin"]})
      group = insert(:group, team: user.team, public: false)
      result = Stitch.GroupAuthorization.can_invite?(group, user)
      assert result == true
    end

    test "returns true for public groups" do
      user = insert(:user, %{roles: ["member"]})
      group = insert(:group, team: user.team, public: true)
      result = Stitch.GroupAuthorization.can_invite?(group, user)
      assert result == true
    end

    test "returns true for private groups for group creator" do
      user = insert(:user, %{roles: ["member"]})
      group = insert(:group, team: user.team, public: false, creator: user)
      result = Stitch.GroupAuthorization.can_invite?(group, user)
      assert result == true
    end

    test "returns false for private groups" do
      user = insert(:user, %{roles: ["member"]})
      group = insert(:group, team: user.team, public: false)
      result = Stitch.GroupAuthorization.can_invite?(group, user)
      assert result == false
    end

    test "returns false for group belinging to another team" do
      user = insert(:user, %{roles: ["admin"]})
      group = insert(:group, public: false)
      result = Stitch.GroupAuthorization.can_invite?(group, user)
      assert result == false
    end
  end

  describe "Stitch.GroupAuthorization.can_toggle_public?/2" do
    test "returns true for admin users" do
      user = insert(:user, roles: ["admin"])
      group = insert(:group, team: user.team, public: false)
      result = Stitch.GroupAuthorization.can_toggle_public?(group, user)
      assert result == true
    end

    test "returns true for private groups for group creator" do
      user = insert(:user, %{roles: ["member"]})
      group = insert(:group, team: user.team, public: false, creator: user)
      result = Stitch.GroupAuthorization.can_toggle_public?(group, user)
      assert result == true
    end

    test "returns false for regular users" do
      user = insert(:user, %{roles: ["member"]})
      group = insert(:group, team: user.team, public: false)
      result = Stitch.GroupAuthorization.can_toggle_public?(group, user)
      assert result == false
    end

    test "returns false for groups belonging to another team" do
      user = insert(:user, roles: ["admin"])
      group = insert(:group, public: false)
      result = Stitch.GroupAuthorization.can_toggle_public?(group, user)
      assert result == false
    end

    test "returns false for guests" do
      team = insert(:team)
      restricted_group = insert(:group, team: team, public: true)
      public_group = insert(:group, team: team, public: true)
      user = insert(:user, team: team, roles: ["multi-room-guest"], groups_as_guest: [restricted_group.id])
      insert(:group_user, user: user, group: restricted_group)

      refute Stitch.GroupAuthorization.can_toggle_public?(restricted_group, user)
      refute Stitch.GroupAuthorization.can_toggle_public?(public_group, user)
    end
  end
end
