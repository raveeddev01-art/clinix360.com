defmodule StitchConnect.Web.MessageReadStatusTest do
  use StitchConnect.Web.ChannelCase
  alias StitchConnect.Web.UserSocket
  alias Stitch.Message

  setup [:create_users, :connect_socket, :create_group, :create_messages]

  test "mark_as_read event marks all unread messages as read for given user",
      %{user2: user2, group: group, messages: messages} do
    {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
    {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{group.slug}")

    assert [_message1, _message2, _message3] = messages

    ref = push socket2, "mark_as_read", %{"group_id": group.id}
    assert_reply ref, :ok, reply

    assert reply[:group_id] == group.id
    assert reply[:last_read_at] != nil
    assert reply[:mentions_count] == 0
    assert reply[:unread_messages_count] == 0

    [message1, message2, message3] = messages |> Enum.map(&Repo.get(Message, &1.id))
    user_id_str = to_string(user2.id)

    assert message1.read_status[user_id_str] != nil
    assert message2.read_status[user_id_str] != nil
    assert message3.read_status[user_id_str] != nil
  end

  test "mark_as_read event returns only updated messages",
      %{socket1: socket1, user2: user2, group: group, messages: messages} do
    {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
    {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{group.slug}")

    assert [_message1, _message2, _message3] = messages

    ref = push socket2, "mark_as_read", %{group_id: group.id}
    assert_reply ref, :ok, %{messages: updated_messages}
    assert length(updated_messages) == 3

    ref = push socket1, "new_msg", %{text_content: "Message 4"}
    assert_reply ref, :ok, %{id: message_id}
    message4 = Repo.get(Message, message_id)

    ref = push socket2, "mark_as_read", %{group_id: group.id}
    assert_reply ref, :ok, %{messages: [message]}
    assert message.id == message4.id
  end

  test "marked_as_read event broadcasted from user events channel when mark_as_read triggered",
      %{user2: user2, group: group, messages: messages} do
    {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
    {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{group.slug}")

    [_message1, _message2, _message3] = messages

    push socket2, "mark_as_read", %{group_id: group.id}

    @endpoint.subscribe("events:#{user2.id}")

    assert_broadcast "marked_as_read", %{messages: updated_messages}
    assert length(updated_messages) == 3
  end

  defp create_messages(%{socket1: socket1, group: group}) do
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    messages = Enum.map(1..3, fn n ->
      ref = push socket1, "new_msg", %{text_content: "Message #{n}"}
      assert_reply ref, :ok, %{id: message_id}
      Repo.get(Message, message_id)
    end)

    {:ok, messages: messages, socket1: socket1}
  end
end
