defmodule Stitch.GroupNotificationPreferenceTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
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
