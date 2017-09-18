defmodule Stitch.MessageReadingTest do
  use Stitch.DataCase
  alias Stitch.{Repo, Message, GroupUser}

  setup :create_group_with_users

  describe "&Message.mark_as_read_all/2" do
    test "updates read_status if it contains the user as a recipient", %{bob: bob, alice: alice, eve: eve, group: group} do
      {:ok, %{message: message}} = Message.create(group.id, eve, %{"text_content" => "Hi, all!", "type" => "chat"})
      assert Map.has_key?(message.read_status, to_string(bob.id))
      assert Map.has_key?(message.read_status, to_string(alice.id))
      assert [nil, nil] == Map.values(message.read_status)

      Message.mark_as_read_all(bob.id, group.id)
      message = Repo.get(Message, message.id)

      read_status = Map.take(message.read_status, [to_string(bob.id), to_string(alice.id)])
      assert read_status[to_string(bob.id)] != nil
      assert read_status[to_string(alice.id)] == nil
    end

    test "doesn't update read_status if it doesn't contain the user as a recipient", %{bob: bob, alice: alice, eve: eve, group: group} do
      {:ok, %{message: message}} = Message.create(group.id, eve, %{"text_content" => "Hi, all!", "type" => "chat"})
      assert Map.has_key?(message.read_status, to_string(bob.id))
      assert Map.has_key?(message.read_status, to_string(alice.id))
      assert [nil, nil] == Map.values(message.read_status)

      Message.mark_as_read_all(eve.id, group.id)
      message = Repo.get(Message, message.id)

      read_status = Map.take(message.read_status, [to_string(bob.id), to_string(alice.id)])
      assert read_status[to_string(bob.id)] == nil
      assert read_status[to_string(alice.id)] == nil
    end

    test "updates group_users.last_read_at, group_users.unread_messages_count, and group_users.mentions_count", %{bob: bob, alice: alice, eve: eve, group: group} do
      {:ok, %{message: message}} = Message.create(group.id, eve, %{"text_content" => "Hi, @bob!", "type" => "chat"})
      assert Map.has_key?(message.read_status, to_string(bob.id))
      assert Map.has_key?(message.read_status, to_string(alice.id))
      assert [nil, nil] == Map.values(message.read_status)

      group_user_bob = Repo.get_by(GroupUser, user_id: bob.id, group_id: group.id)
      assert group_user_bob.mentions_count == 1
      assert group_user_bob.unread_messages_count == 1
      last_read_at_before = group_user_bob.last_read_at

      Message.mark_as_read_all(bob.id, group.id)

      group_user_bob = Repo.get_by(GroupUser, user_id: bob.id, group_id: group.id)
      assert group_user_bob.mentions_count == 0
      assert group_user_bob.unread_messages_count == 0
      assert group_user_bob.last_read_at != nil
      assert last_read_at_before != group_user_bob.last_read_at
    end
  end

  def create_group_with_users(_) do
    team = insert(:team)
    bob = insert(:user, username: "bob", team: team)
    alice = insert(:user, username: "alice", team: team)
    eve = insert(:user, username: "eve", team: team)
    group = insert(:group, slug: "general", team: team)
    _group_user_bob = insert(:group_user, user: bob, group: group)
    _group_users_alice = insert(:group_user, user: alice, group: group)
    _group_user_eve = insert(:group_user, user: eve, group: group)
    {:ok, bob: bob, alice: alice, eve: eve, group: group}
  end
end
