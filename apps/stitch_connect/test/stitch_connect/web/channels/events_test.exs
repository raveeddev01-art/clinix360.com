defmodule StitchConnect.Web.EventsTest do
  use StitchConnect.Web.ChannelCase

  setup [:create_users, :connect_socket, :create_group]

  test "group participants receives new_message event",
      %{socket1: socket1, user1: user1, user2: user2, group: group} do
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    @endpoint.subscribe("events:#{user2.id}")

    push socket1, "new_msg", %{text_content: "Hello, @#{user2.username}"}

    assert_broadcast "new_message", data

    assert data.user_id == user1.id
    assert data.text_content == "Hello, @user2"
    assert data.unread_messages_count == 1
    assert data.mentions_count == 1
  end

  test "group participants receives message_deleted event",
      %{socket1: socket1, user2: user2, group: group} do
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    ref = push socket1, "new_msg", %{text_content: "Hello, @#{user2.username}"}
    assert_reply ref, :ok, message

    @endpoint.subscribe("events:#{user2.id}")

    push socket1, "delete_msg", %{message_id: message.id}

    assert_broadcast "message_deleted", %{id: message_id, unread_messages_count: unread_messages_count, mentions_count: mentions_count}
    assert message_id == message.id
    assert unread_messages_count == 0
    assert mentions_count == 0
  end
end
