defmodule Stitch.Mobile.BadgeValueTest do
  use Stitch.DataCase
  alias Stitch.{Group, Mobile, Message}

  setup do
    user = insert(:user)
    {:ok, user: user}
  end

  test "sums unreads and mentions accross all the groups the user is member of", %{user: user} do
    insert(:group_user, user: user, mobile_notification_preference: "nothing", mentions_count: 100, unread_messages_count: 100)
    insert(:group_user, user: user, mobile_notification_preference: "mentions", mentions_count: 2, unread_messages_count: 100)
    insert(:group_user, user: user, mobile_notification_preference: "everything", mentions_count: 1, unread_messages_count: 40)
    assert Mobile.badge_value(user) == 42
  end

  describe "non-DM rooms" do
    test "when global mobile notification setting is 'everything'", %{} do
      user = insert(:user, mobile_notification_preference: "everything")
      insert(:group_user, user: user, mobile_notification_preference: "default", mentions_count: 0, unread_messages_count: 1)
      assert Mobile.badge_value(user) == 1
    end

    test "when global mobile notification setting is 'mentions'" do
      user = insert(:user, mobile_notification_preference: "mentions")
      insert(:group_user, user: user, mobile_notification_preference: "default", mentions_count: 1, unread_messages_count: 100)
      assert Mobile.badge_value(user) == 1
    end

    test "when global mobile notification setting is 'nothing'" do
      user = insert(:user, mobile_notification_preference: "nothing")
      insert(:group_user, user: user, mobile_notification_preference: "default", mentions_count: 50, unread_messages_count: 100)
      assert Mobile.badge_value(user) == 0
    end
  end

  describe "DM rooms" do
    setup do
      team = insert(:team)
      bob = insert(:user, team: team)
      {:ok, team: team, bob: bob}
    end

    test "when global mobile notification setting is 'everything'", %{team: team, bob: bob} do
      joe = insert(:user, team: team, mobile_notification_preference: "everything")
      {:ok, group} = Group.create_single_dm(bob, [bob.id, joe.id])
      Message.create(group.id, bob, %{"text_content" => "Lorem ipsum"})

      assert Mobile.badge_value(joe) == 1
    end

    test "when global mobile notification setting is 'mentions'", %{team: team, bob: bob} do
      joe = insert(:user, team: team, mobile_notification_preference: "mentions")
      {:ok, group} = Group.create_single_dm(bob, [bob.id, joe.id])
      Message.create(group.id, bob, %{"text_content" => "Doesn't mention anyone"})

      assert Mobile.badge_value(joe) == 1
    end

    test "when global mobile notification setting is 'nothing'", %{team: team, bob: bob} do
      joe = insert(:user, team: team, mobile_notification_preference: "nothing")
      {:ok, group} = Group.create_single_dm(bob, [bob.id, joe.id])
      Message.create(group.id, bob, %{"text_content" => "Lorem ipsum"})

      assert Mobile.badge_value(joe) == 0
    end
  end
end
