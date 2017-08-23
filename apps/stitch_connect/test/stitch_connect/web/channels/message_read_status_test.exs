defmodule StitchConnect.Web.MessageReadStatusTest do
  use StitchConnect.Web.ChannelCase
  alias StitchConnect.Web.UserSocket
  alias Stitch.Message

  setup [:create_users, :connect_socket, :create_group, :create_messages]

  test "mark_as_read event marks multiple messages as read for given user",
      %{user2: user2, group: group, messages: messages} do
    {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
    {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{group.slug}")

    [message1, message2, _] = messages

    ref = push socket2, "mark_as_read", %{message_ids: [message1.id, message2.id]}
    assert_reply ref, :ok, _reply

    [message1, message2, message3] = messages |> Enum.map(&Repo.get(Message, &1.id))
    user_id_str = to_string(user2.id)

    assert Map.has_key?(message1.read_status, user_id_str)
    assert Map.has_key?(message2.read_status, user_id_str)
    refute Map.has_key?(message3.read_status, user_id_str)
  end

  test "mark_as_read event returns only updated messages",
      %{user2: user2, group: group, messages: messages} do
    {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
    {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{group.slug}")

    [message1, message2, _] = messages

    ref = push socket2, "mark_as_read", %{message_ids: [message1.id, message2.id]}
    assert_reply ref, :ok, %{messages: updated_messages}
    assert length(updated_messages) == 2

    ref = push socket2, "mark_as_read", %{message_ids: [message1.id, message2.id]}
    assert_reply ref, :ok, %{messages: []}
  end

  test "marked_as_read event broadcasted from user events channel when mark_as_read triggered",
      %{user2: user2, group: group, messages: messages} do
    {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
    {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{group.slug}")

    [message1, message2, _] = messages

    push socket2, "mark_as_read", %{message_ids: [message1.id, message2.id]}

    @endpoint.subscribe("events:#{user2.id}")

    assert_broadcast "marked_as_read", %{messages: updated_messages}
    assert length(updated_messages) == 2
  end

  defp create_messages(%{socket1: socket1, group: group}) do
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    messages = Enum.map(1..3, fn n ->
      ref = push socket1, "new_msg", %{text_content: "Message #{n}"}
      assert_reply ref, :ok, %{id: message_id}
      Repo.get(Message, message_id)
    end)

    {:ok, messages: messages}
  end
end
