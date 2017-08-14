defmodule Stitch.GroupNotificationPreferenceTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.GroupNotificationPreference.update_for_user/3" do
    test "it returns user preference for group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, preference} = Stitch.GroupNotificationPreference.create_for_user(group.id, user.id, "everything")

      {:ok, preference} = Stitch.GroupNotificationPreference.update_for_user(group.id, user.id, "mentions")
      assert preference.setting == "mentions"
    end

    test "it returns error if setting value is invalid" do
      group = insert(:group)
      user = insert(:user)
      {:ok, preference} = Stitch.GroupNotificationPreference.create_for_user(group.id, user.id, "everything")

      {:error, reason} = Stitch.GroupNotificationPreference.update_for_user(group.id, user.id, "foobar")
      assert reason == "Setting value is invalid"
    end
  end

  describe "Stitch.GroupNotificationPreference.get_for_user/2" do
    test "it returns user preference for group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, preference} = Stitch.GroupNotificationPreference.create_for_user(group.id, user.id, "everything")

      {:ok, preference} = Stitch.GroupNotificationPreference.get_for_user(group.id, user.id)
      assert preference.setting == "everything"
    end

    test "it creates preference if user doesn't have one" do
      user = insert(:user)
      group = insert(:group)
      {:ok, preference} = Stitch.GroupNotificationPreference.get_for_user(group.id, user.id)
      assert preference.group_id == group.id
      assert preference.user_id == user.id
    end
  end

  describe "Stitch.GroupNotificationPreference.create_for_user/3" do
    test "it creates the everything notification preference for user group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, preference} = Stitch.GroupNotificationPreference.create_for_user(group.id, user.id, "everything")
      assert preference.setting == "everything"
    end

    test "it creates the mentions notification preference for user group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, preference} = Stitch.GroupNotificationPreference.create_for_user(group.id, user.id, "mentions")
      assert preference.setting == "mentions"
    end

    test "it creates the nothing notification preference for user group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, preference} = Stitch.GroupNotificationPreference.create_for_user(group.id, user.id, "nothing")
      assert preference.setting == "nothing"
    end

    test "it creates the mentions notification preference for user group by default" do
      group = insert(:group)
      user = insert(:user)
      {:ok, preference} = Stitch.GroupNotificationPreference.create_for_user(group.id, user.id)
      assert preference.setting == "mentions"
    end

    test "it returns error for bad setting value" do
      group = insert(:group)
      user = insert(:user)
      {:error, reason} = Stitch.GroupNotificationPreference.create_for_user(group.id, user.id, "foobar")
      assert reason == "Setting value is invalid"
    end
  end
end
