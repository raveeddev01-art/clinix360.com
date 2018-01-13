defmodule Stitch.Message.MarkAsUnreadTest do
  use Stitch.DataCase
  alias Stitch.{Repo, Message, GroupUser}

  setup do
    team = insert(:team)
    bob = insert(:user, username: "bob", team: team)
    joe = insert(:user, username: "joe", team: team)
    group = insert(:group, team: team)
    insert(:group_user, user: bob, group: group)
    insert(:group_user, user: joe, group: group)

    {:ok, bob: bob, joe: joe, group: group, team: team}
  end

  describe "read_status" do
    test "updates read_status when user is in the list of recipients", %{bob: bob, joe: joe, group: group} do
      {:ok, %{message: message1}} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: message2}} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: message3}} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})

      Message.mark_as_read(bob.id, group.id)
      Message.mark_as_unread(bob.id, group.id, message2)

      assert Repo.get(Message, message1.id).read_status[to_string(bob.id)] != nil
      assert Repo.get(Message, message2.id).read_status[to_string(bob.id)] == nil
      assert Repo.get(Message, message3.id).read_status[to_string(bob.id)] == nil
    end

    test "when messages are already unread, marks messages before the target message as read", %{bob: bob, joe: joe, group: group} do
      {:ok, %{message: message1}} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: message2}} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: message3}} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})

      Message.mark_as_unread(bob.id, group.id, message2)

      assert Repo.get(Message, message1.id).read_status[to_string(bob.id)] != nil
      assert Repo.get(Message, message2.id).read_status[to_string(bob.id)] == nil
      assert Repo.get(Message, message3.id).read_status[to_string(bob.id)] == nil
    end

    test "doesn't update read_status if the user isn't in the recipient list", %{bob: bob, group: group} do
      {:ok, %{message: _message1}} = Message.create(group.id, bob, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: message2}} = Message.create(group.id, bob, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: _message3}} = Message.create(group.id, bob, %{"text_content" => "Lorem ipsum", "type" => "chat"})

      Message.mark_as_read(bob.id, group.id)
      assert {:error, "No messages from other users after the target message"} = Message.mark_as_unread(bob.id, group.id, message2)
    end
  end

  describe "last_read_at, unread_messages_count, and mentions_count" do
    test "updates group_users.last_read_at, group_users.unread_messages_count, and group_users.mentions_count", %{bob: bob, joe: joe, group: group} do
      {:ok, %{message: _message1}} = Message.create(group.id, bob, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: message2}} = Message.create(group.id, bob, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: _message3}} = Message.create(group.id, bob, %{"text_content" => "Mentions <@U#{joe.id}>", "type" => "chat"})

      Message.mark_as_read(joe.id, group.id)
      Message.mark_as_unread(joe.id, group.id, message2)

      group_user = Repo.get_by(GroupUser, user_id: joe.id, group_id: group.id)
      assert group_user.last_read_at == message2.inserted_at
      assert group_user.mentions_count == 1
      assert group_user.unread_messages_count == 2
    end

    test "doesn't count system messages in unread_messages_count", %{bob: bob, joe: joe, group: group, team: team} do
      sam = insert(:user, team: team)
      tim = insert(:user, team: team)
      {:ok, %{message: message1}} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{system_message: _system_message}} = Stitch.Group.add_user(group, sam.id)
      {:ok, %{system_message: _system_message}} = Stitch.Group.add_user(group, tim.id)
      {:ok, %{message: _message2}} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: _message3}} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})

      Message.mark_as_read(bob.id, group.id)
      Message.mark_as_unread(bob.id, group.id, message1)

      group_user = Repo.get_by(GroupUser, user_id: bob.id, group_id: group.id)
      assert group_user.mentions_count == 0
      assert group_user.unread_messages_count == 3
      assert group_user.last_read_at == message1.inserted_at
    end

    test "doesn't count author messages in unread_messages_count", %{bob: bob, joe: joe, group: group} do
      {:ok, %{message: _message1}} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: message2}} = Message.create(group.id, bob, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: _message3}} = Message.create(group.id, bob, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: _message4}} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: _message5}} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})

      Message.mark_as_read(bob.id, group.id)
      Message.mark_as_unread(bob.id, group.id, message2)

      group_user = Repo.get_by(GroupUser, user_id: bob.id, group_id: group.id)
      assert group_user.mentions_count == 0
      assert group_user.unread_messages_count == 2
      assert group_user.last_read_at == message2.inserted_at
    end

    test "when the target message is a system message", %{bob: bob, joe: joe, group: group, team: team} do
      sam = insert(:user, team: team)
      {:ok, %{message: message1}} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{system_message: _system_message}} = Stitch.Group.add_user(group, sam.id)
      {:ok, %{message: _message3}} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})

      Message.mark_as_read(bob.id, group.id)
      Message.mark_as_unread(bob.id, group.id, message1)

      group_user = Repo.get_by(GroupUser, user_id: bob.id, group_id: group.id)
      assert group_user.mentions_count == 0
      assert group_user.unread_messages_count == 2
      assert group_user.last_read_at == message1.inserted_at
    end

    test "when the target mesage is the author's message", %{bob: bob, joe: joe, group: group} do
      {:ok, %{message: _message1}} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: message2}} = Message.create(group.id, bob, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{message: _message3}} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})

      Message.mark_as_read(bob.id, group.id)
      Message.mark_as_unread(bob.id, group.id, message2)

      group_user = Repo.get_by(GroupUser, user_id: bob.id, group_id: group.id)
      assert group_user.mentions_count == 0
      assert group_user.unread_messages_count == 1
      assert group_user.last_read_at == message2.inserted_at
    end

    test "when the target message is a system message and the messages before it are system messages or author's messages",
      %{bob: bob, joe: joe, group: group, team: team} do
      {:ok, _} = Stitch.Group.add_user(group, insert(:user, team: team).id)
      {:ok, _} = Message.create(group.id, bob, %{"text_content" => "Lorem ipsum", "type" => "chat"})
      {:ok, %{system_message: system_message2}} = Stitch.Group.add_user(group, insert(:user, team: team).id)
      {:ok, _} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})

      Message.mark_as_read(bob.id, group.id)
      assert {:error, "System message can't be marked as unread"} = Message.mark_as_unread(bob.id, group.id, system_message2)

      group_user = Repo.get_by(GroupUser, user_id: bob.id, group_id: group.id)
      assert group_user.mentions_count == 0
      assert group_user.unread_messages_count == 0
    end

    test "when the target message is a system message and there are no messages before it", %{bob: bob, joe: joe, group: group, team: team} do
      {:ok, %{system_message: system_message2}} = Stitch.Group.add_user(group, insert(:user, team: team).id)
      {:ok, _} = Message.create(group.id, joe, %{"text_content" => "Lorem ipsum", "type" => "chat"})

      Message.mark_as_read(bob.id, group.id)
      assert {:error, "System message can't be marked as unread"} = Message.mark_as_unread(bob.id, group.id, system_message2)

      group_user = Repo.get_by(GroupUser, user_id: bob.id, group_id: group.id)
      assert group_user.mentions_count == 0
      assert group_user.unread_messages_count == 0
    end
  end
end
