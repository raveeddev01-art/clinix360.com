defmodule Stitch.GroupAuthorizationTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.GroupAuthorization.can_view?/2" do
    test "returns true public groups" do
      user = insert(:user)
      group = insert(:group)
      result = Stitch.GroupAuthorization.can_view?(group.id, user.id)
      assert result == true
    end

    test "return true for groups he belongs to" do
      user = insert(:user)
      group = insert(:group)
      insert(:group_user, %{user: user, group: group})
      result = Stitch.GroupAuthorization.can_view?(group.id, user.id)
      assert result == true
    end

    test "returns false for private groups he doesn't belong to" do
      user = insert(:user)
      group = insert(:group, %{public: false})
      result = Stitch.GroupAuthorization.can_view?(group.id, user.id)
      assert result == false
    end
  end

  describe "Stitch.GroupAuthorization.is_member?2" do
    test "returns true if user is member" do
      user = insert(:user)
      group = insert(:group)
      insert(:group_user, %{user: user, group: group})
      result = Stitch.GroupAuthorization.is_member?(group.id, user.id)
      assert result == true
    end

    test "returns false if user isn't member" do
      user = insert(:user)
      group = insert(:group)
      result = Stitch.GroupAuthorization.is_member?(group.id, user.id)
      assert result == false
    end
  end

  describe "Stitch.GroupAuthorization.can_invite?/2" do
    test "returns true for admin users" do
      group = insert(:group, %{public: false})
      user = insert(:user, %{roles: ["admin"]})
      result = Stitch.GroupAuthorization.can_invite?(group.id, user.id)
      assert result == true
    end

    test "returns true for public groups" do
      group = insert(:group, %{public: true})
      user = insert(:user, %{roles: ["member"]})
      result = Stitch.GroupAuthorization.can_invite?(group.id, user.id)
      assert result == true
    end

    test "returns true for private groups for group creator" do
      user = insert(:user, %{roles: ["member"]})
      group = insert(:group, %{public: false, creator: user})
      result = Stitch.GroupAuthorization.can_invite?(group.id, user.id)
      assert result == true
    end

    test "returns false for private groups" do
      user = insert(:user, %{roles: ["member"]})
      group = insert(:group, %{public: false})
      result = Stitch.GroupAuthorization.can_invite?(group.id, user.id)
      assert result == false
    end
  end

  describe "Stitch.GroupAuthorization.can_toggle_public?/2" do
    test "returns true for admin users" do
      group = insert(:group, %{public: false})
      user = insert(:user, %{roles: ["admin"]})
      result = Stitch.GroupAuthorization.can_toggle_public?(group, user)
      assert result == true
    end

    test "returns true for private groups for group creator" do
      user = insert(:user, %{roles: ["member"]})
      group = insert(:group, %{public: false, creator: user})
      result = Stitch.GroupAuthorization.can_toggle_public?(group, user)
      assert result == true
    end

    test "returns false for regular users" do
      user = insert(:user, %{roles: ["member"]})
      group = insert(:group, %{public: false})
      result = Stitch.GroupAuthorization.can_toggle_public?(group, user)
      assert result == false
    end
  end
end
