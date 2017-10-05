defmodule Stitch.MessageReadingTest do
  use Stitch.DataCase
  alias Stitch.{Repo, Message, GroupUser}

  setup :create_group_with_users

  describe "&Message.mark_message_as_unread/3" do
    test "updates read_status if the user is in the recipient list", %{bob: bob, alice: alice, group: group} do
      {:ok, %{message: message1}} = Message.create(group.id, alice, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: message2}} = Message.create(group.id, alice, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: message3}} = Message.create(group.id, alice, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      Message.mark_as_read(bob.id, group.id)
      Message.mark_as_unread(bob.id, group.id, message2)

      refute Repo.get(Message, message1.id).read_status[to_string(bob.id)] == nil
      assert Repo.get(Message, message2.id).read_status[to_string(bob.id)] == nil
      assert Repo.get(Message, message3.id).read_status[to_string(bob.id)] == nil
    end

    test "when messages are already unread, marks messages before the target message as read", %{bob: bob, alice: alice, group: group} do
      {:ok, %{message: message1}} = Message.create(group.id, alice, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: message2}} = Message.create(group.id, alice, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: message3}} = Message.create(group.id, alice, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      Message.mark_as_unread(bob.id, group.id, message2)

      refute Repo.get(Message, message1.id).read_status[to_string(bob.id)] == nil
      assert Repo.get(Message, message2.id).read_status[to_string(bob.id)] == nil
      assert Repo.get(Message, message3.id).read_status[to_string(bob.id)] == nil
    end

    test "doesn't update read_status if the user isn't in the recipient list", %{bob: bob, group: group} do
      {:ok, %{message: message1}} = Message.create(group.id, bob, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: message2}} = Message.create(group.id, bob, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: message3}} = Message.create(group.id, bob, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      Message.mark_as_read(bob.id, group.id)
      Message.mark_as_unread(bob.id, group.id, message2)

      refute Map.has_key?(Repo.get(Message, message1.id).read_status, to_string(bob.id))
      refute Map.has_key?(Repo.get(Message, message2.id).read_status, to_string(bob.id))
      refute Map.has_key?(Repo.get(Message, message3.id).read_status, to_string(bob.id))
    end

    test "updates group_users.last_read_at, group_users.unread_messages_count, and group_users.mentions_count", %{bob: bob, alice: alice, group: group} do
      {:ok, %{message: _message1}} = Message.create(group.id, bob, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: message2}} = Message.create(group.id, bob, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: _message3}} = Message.create(group.id, bob, %{"text_content" => "Mentions @#{alice.username}", "type" => "chat"})

      Message.mark_as_read(alice.id, group.id)
      group_user = Repo.get_by(GroupUser, user_id: alice.id, group_id: group.id)
      assert group_user.mentions_count == 0
      assert group_user.unread_messages_count == 0

      Message.mark_as_unread(alice.id, group.id, message2)
      group_user = Repo.get_by(GroupUser, user_id: alice.id, group_id: group.id)
      assert group_user.last_read_at == message2.inserted_at
      assert group_user.mentions_count == 1
      assert group_user.unread_messages_count == 2
    end
  end

  describe "&Message.mark_as_read/2" do
    test "updates read_status if it contains the user as a recipient", %{bob: bob, alice: alice, eve: eve, group: group} do
      {:ok, %{message: message}} = Message.create(group.id, eve, %{"text_content" => "Hi, all!", "type" => "chat"})
      assert Map.has_key?(message.read_status, to_string(bob.id))
      assert Map.has_key?(message.read_status, to_string(alice.id))
      assert [nil, nil] == Map.values(message.read_status)

      Message.mark_as_read(bob.id, group.id)
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

      Message.mark_as_read(eve.id, group.id)
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

      Message.mark_as_read(bob.id, group.id)

      group_user_bob = Repo.get_by(GroupUser, user_id: bob.id, group_id: group.id)
      assert group_user_bob.mentions_count == 0
      assert group_user_bob.unread_messages_count == 0
      assert group_user_bob.last_read_at != nil
      assert last_read_at_before != group_user_bob.last_read_at
    end
  end

  describe "&Message.create/3" do
    test "marks existing messages in the group as read when within the unread limit", %{bob: bob, alice: alice, group: group} do
      {:ok, %{message: message1}} = Message.create(group.id, alice, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: _message2}} = Message.create(group.id, bob, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      refute Repo.get(Message, message1.id).read_status[to_string(bob.id)] == nil
    end

    test "doesn't mark existing messages in the group as read if the unread limit is excedeed", %{bob: bob, alice: alice, group: group} do
      messages = 1..30 |> Enum.map(fn _ -> [user_id: alice.id, group_id: group.id, text_content: "Lorem ipsum", type: "chat", read_status: %{bob.id => nil}, inserted_at: NaiveDateTime.utc_now, updated_at: NaiveDateTime.utc_now] end)
      {30, [message1|_]} = Repo.insert_all(Message, messages, returning: true)
      {:ok, %{message: _message2}} = Message.create(group.id, bob, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      assert Repo.get(Message, message1.id).read_status[to_string(bob.id)] == nil
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
