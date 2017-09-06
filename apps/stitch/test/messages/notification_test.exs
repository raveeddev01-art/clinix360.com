defmodule Stitch.Message.NotificationTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Message.Notification.notify_user_ids/1" do
    test "excludes author from regular channel" do
      team = insert(:team)
      bob = insert(:user, username: "bob", team: team, desktop_notification_preference: "everything", mobile_notification_preference: "everything")
      alice = insert(:user, username: "alice", team: team, desktop_notification_preference: "nothing", mobile_notification_preference: "nothing")
      general = insert(:group, slug: "general", team: team)
      _general_bob = insert(:group_user, user: bob, group: general, desktop_notification_preference: "default", mobile_notification_preference: "default")
      _general_alice = insert(:group_user, user: alice, group: general, desktop_notification_preference: "nothing", mobile_notification_preference: "nothing")

      assert %{desktop: [], mobile: []} = Stitch.Message.Notification.notify_user_ids(general, bob, [])
      assert %{desktop: [bob_id], mobile: [bob_id]} = Stitch.Message.Notification.notify_user_ids(general, alice, [])
      assert bob_id == bob.id
    end

    test "excludes author from dm" do
      team = insert(:team)
      bob = insert(:user, username: "bob", team: team, desktop_notification_preference: "everything", mobile_notification_preference: "everything")
      alice = insert(:user, username: "alice", team: team, desktop_notification_preference: "everything", mobile_notification_preference: "everything")
      dm = insert(:group, slug: "__dm:#{bob.id},#{alice.id}", team: team)
      _dm_bob = insert(:group_user, user: bob, group: dm)
      _dm_alice = insert(:group_user, user: alice, group: dm)

      assert %{desktop: [alice_id], mobile: [alice_id]} = Stitch.Message.Notification.notify_user_ids(dm, bob, [])
      assert alice_id == alice.id
    end

    test "user's channel notification setting is replaced by user's global notification setting if it's set to default" do
      team = insert(:team)
      bob = insert(:user, username: "bob", team: team, desktop_notification_preference: "everything", mobile_notification_preference: "everything")
      alice = insert(:user, username: "alice", team: team)
      general = insert(:group, slug: "general", team: team)
      _general_bob = insert(:group_user, user: bob, group: general, desktop_notification_preference: "default", mobile_notification_preference: "default")
      _general_alice = insert(:group_user, user: alice, group: general)

      assert %{desktop: [bob_id], mobile: [bob_id]} = Stitch.Message.Notification.notify_user_ids(general, alice, [])
      assert bob_id == bob.id
    end

    test "user's channel notification setting takes precedence over user's global notification setting if it isn't set to default" do
      team = insert(:team)
      bob = insert(:user, username: "bob", team: team, desktop_notification_preference: "everything", mobile_notification_preference: "everything")
      alice = insert(:user, username: "alice", team: team)
      general = insert(:group, slug: "general", team: team)
      _general_bob = insert(:group_user, user: bob, group: general, desktop_notification_preference: "mentions", mobile_notification_preference: "mentions")
      _general_alice = insert(:group_user, user: alice, group: general)

      assert %{desktop: [], mobile: []} = Stitch.Message.Notification.notify_user_ids(general, alice, [])
    end

    test "user isn't notified by mention if his notification setting is set to nothing" do
      team = insert(:team)
      bob = insert(:user, username: "bob", team: team, desktop_notification_preference: "nothing", mobile_notification_preference: "nothing")
      alice = insert(:user, username: "alice", team: team)
      general = insert(:group, slug: "general", team: team)
      _general_bob = insert(:group_user, user: bob, group: general, desktop_notification_preference: "default", mobile_notification_preference: "default")
      _general_alice = insert(:group_user, user: alice, group: general)

      assert %{desktop: [], mobile: []} = Stitch.Message.Notification.notify_user_ids(general, alice, [bob.id])
    end

    test "user is notified by mention if his notification setting is set to mentions" do
      team = insert(:team)
      bob = insert(:user, username: "bob", team: team, desktop_notification_preference: "mentions", mobile_notification_preference: "mentions")
      alice = insert(:user, username: "alice", team: team)
      general = insert(:group, slug: "general", team: team)
      _general_bob = insert(:group_user, user: bob, group: general, desktop_notification_preference: "default", mobile_notification_preference: "default")
      _general_alice = insert(:group_user, user: alice, group: general)

      assert %{desktop: [bob_id], mobile: [bob_id]} = Stitch.Message.Notification.notify_user_ids(general, alice, [bob.id])
      assert bob_id == bob.id
    end

    test "user isn't notified if his notification setting is set to mention and the message doesn't contain his mention keywords" do
      team = insert(:team)
      bob = insert(:user, username: "bob", team: team, desktop_notification_preference: "mentions", mobile_notification_preference: "mentions")
      alice = insert(:user, username: "alice", team: team)
      general = insert(:group, slug: "general", team: team)
      _general_bob = insert(:group_user, user: bob, group: general, desktop_notification_preference: "default", mobile_notification_preference: "default")
      _general_alice = insert(:group_user, user: alice, group: general)

      assert %{desktop: [], mobile: []} = Stitch.Message.Notification.notify_user_ids(general, alice, [])
    end

    test "user isn't notified by a dm or multi-dm message if his notification setting is set to nothihg" do
      team = insert(:team)
      bob = insert(:user, username: "bob", team: team, desktop_notification_preference: "nothing", mobile_notification_preference: "nothing")
      alice = insert(:user, username: "alice", team: team)
      dm = insert(:group, slug: "__dm:#{bob.id},#{alice.id}", team: team)
      _dm_bob = insert(:group_user, user: bob, group: dm)
      _dm_alice = insert(:group_user, user: alice, group: dm)

      assert %{desktop: [], mobile: []} = Stitch.Message.Notification.notify_user_ids(dm, alice, [])
    end

    test "user is notified by a dm or multi-dm message when the message doesn't contain his mention keywords" do
      team = insert(:team)
      bob = insert(:user, username: "bob", team: team, desktop_notification_preference: "mentions", mobile_notification_preference: "mentions")
      alice = insert(:user, username: "alice", team: team)
      dm = insert(:group, slug: "__dm:#{bob.id},#{alice.id}", team: team)
      _dm_bob = insert(:group_user, user: bob, group: dm)
      _dm_alice = insert(:group_user, user: alice, group: dm)

      assert %{desktop: [bob_id], mobile: [bob_id]} = Stitch.Message.Notification.notify_user_ids(dm, alice, [])
      assert bob_id == bob.id
    end

    test "with multiple users" do
      team = insert(:team)
      bob = insert(:user, username: "bob", team: team, desktop_notification_preference: "everything", mobile_notification_preference: "everything")
      alice = insert(:user, username: "alice", team: team, desktop_notification_preference: "nothing", mobile_notification_preference: "nothing")
      eve = insert(:user, username: "eve", team: team, desktop_notification_preference: "mentions", mobile_notification_preference: "mentions")
      general = insert(:group, slug: "general", team: team)
      _general_bob = insert(:group_user, user: bob, group: general, desktop_notification_preference: "default", mobile_notification_preference: "default")
      _general_alice = insert(:group_user, user: alice, group: general, desktop_notification_preference: "nothing", mobile_notification_preference: "nothing")
      _general_eve = insert(:group_user, user: eve, group: general, desktop_notification_preference: "nothing", mobile_notification_preference: "nothing")

      assert %{desktop: [], mobile: []} = Stitch.Message.Notification.notify_user_ids(general, bob, [])

      assert %{desktop: [bob_id], mobile: [bob_id]} = Stitch.Message.Notification.notify_user_ids(general, alice, [])
      assert bob_id == bob.id
    end
  end
end
