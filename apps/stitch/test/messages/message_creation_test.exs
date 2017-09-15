defmodule Stitch.MessageCreationTest do
  use Stitch.DataCase
  alias Stitch.Message

  setup :create_user_and_group

  describe "&Message.create/3" do
    test "creates message with given group, user, and content", %{group: group, user: user} do
      assert {:ok, %{message: message}} = Message.create(group.id, user, %{"text_content" => "Hello, World!"})
      assert message.text_content == "Hello, World!"
    end
  end

  describe "&Message.mark_as_read/2" do
    test "marks given message ids as read by given user", %{group: group, user: user} do
      user2 = insert(:user)

      {:ok, %{message: message}} = Message.create(group.id, user, %{"text_content" => "Hello, World!"})
      Message.mark_as_read(user2, message.id)

      message = Repo.get Message, message.id
      assert message.read_status[to_string(user2.id)] == nil
    end

    test "when marking the same message as read twice, oldest entry is keeped", %{group: group, user: user} do
      user2 = insert(:user)

      {:ok, %{message: message}} = Message.create(group.id, user, %{"text_content" => "Hello, World!"})
      Message.mark_as_read(user2, message.id)

      message = Repo.get Message, message.id

      Message.mark_as_read(user2, message.id)
      message2 = Repo.get Message, message.id

      assert message.read_status == message2.read_status
    end

    test "returns updates messages and count", %{group: group, user: user} do
      user2 = insert(:user, team: user.team)
      insert(:group_user, user: user2, group: group)

      {:ok, %{message: message}} = Message.create(group.id, user, %{"text_content" => "Hello, World!"})
      assert {1, [updated_message]} = Message.mark_as_read(user2, message.id)
      assert message.id == updated_message.id
      assert message.read_status != updated_message

      assert {0, []} = Message.mark_as_read(user2, message.id)
    end
  end

  describe "&Message.mark_as_read_all/2" do
    test "marks all messages of given group id as read by given user", %{group: group, user: user} do
      user2 = insert(:user, team: user.team)
      insert(:group_user, user: user2, group: group)

      {:ok, %{message: message}} = Message.create(group.id, user, %{"text_content" => "Hello, World!"})
      Message.mark_as_read_all(user2, group.id)

      message = Repo.get Message, message.id
      assert Map.has_key?(message.read_status, to_string(user2.id))
    end

    test "when marking the same message as read twice, oldest entry is keeped", %{group: group, user: user} do
      user2 = insert(:user)

      {:ok, %{message: message}} = Message.create(group.id, user, %{"text_content" => "Hello, World!"})
      Message.mark_as_read_all(user2, group.id)

      message = Repo.get Message, message.id

      Message.mark_as_read_all(user2, group.id)
      message2 = Repo.get Message, message.id

      assert message.read_status == message2.read_status
    end

    test "returns updates messages and count", %{group: group, user: user} do
      user2 = insert(:user, team: user.team)
      insert(:group_user, user: user2, group: group)

      {:ok, %{message: message}} = Message.create(group.id, user, %{"text_content" => "Hello, World!"})
      assert {1, [updated_message]} = Message.mark_as_read_all(user2, group.id)
      assert message.id == updated_message.id
      assert message.read_status != updated_message

      assert {0, []} = Message.mark_as_read_all(user2, group.id)
    end
  end

  defp create_user_and_group(_) do
    user = insert(:user)
    group = insert(:group)
    insert(:group_user, user: user, group: group)

    {:ok, user: user, group: group}
  end
end
