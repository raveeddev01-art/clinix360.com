defmodule StitchConnect.Web.ChannelMessageTest do
  use StitchConnect.Web.ChannelCase
  alias StitchConnect.Web.UserSocket
  alias Stitch.Message

  setup [:create_users, :connect_socket, :create_group]

  test "new_msg event returns creates message and returns it", %{socket1: socket1, group: group} do
    uniq_content = Ecto.UUID.generate

    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    refute Repo.get_by(Message, text_content: uniq_content)

    ref = push socket1, "new_msg", %{text_content: uniq_content}
    assert_reply ref, :ok, reply

    message = Repo.get_by(Message, text_content: uniq_content)

    assert message
    assert reply.id == message.id
    assert reply.text_content == uniq_content
  end

  test "new_msg event broadcasts new message to other channel members",
      %{socket1: socket1, user1: user1, group: group} do
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    @endpoint.subscribe("groups:#{group.slug}")

    push socket1, "new_msg", %{text_content: "Hello, World!"}

    assert_broadcast "new_msg", data

    assert data.user_id == user1.id
    assert data.text_content == "Hello, World!"
  end

  test "message can be deleted or edited only by author",
      %{socket1: socket1, user2: user2, group: group} do
    {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
    {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{group.slug}")
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    ref1 = push socket1, "new_msg", %{text_content: "Hello, World!"}
    assert_reply ref1, :ok, message

    ref2 = push socket2, "edit_msg", %{message_id: message.id, params: %{text_content: "New Content"}}
    assert_reply ref2, :error, %{message: "Message not found."}

    ref3 = push socket2, "delete_msg", %{message_id: message.id}
    assert_reply ref3, :error, %{message: "Message not found."}
  end

  test "edit_msg event changes message content and broadcasts it",
      %{socket1: socket1, group: group} do
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    ref1 = push socket1, "new_msg", %{text_content: "Hello, World!"}
    assert_reply ref1, :ok, message

    @endpoint.subscribe("groups:#{group.slug}")

    ref2 = push socket1, "edit_msg", %{message_id: message.id, params: %{text_content: "New Content"}}
    assert_reply ref2, :ok, edited_message

    assert message.id == edited_message.id
    assert Repo.get(Message, message.id).text_content == "New Content"

    assert_broadcast "edit_msg", data
    assert data.id == edited_message.id
    assert data.text_content == edited_message.text_content
  end

  test "delete_msg event deletes message and broadcasts it's id",
      %{socket1: socket1, group: group} do
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    ref1 = push socket1, "new_msg", %{text_content: "Hello, World!"}
    assert_reply ref1, :ok, message

    @endpoint.subscribe("groups:#{group.slug}")

    ref2 = push socket1, "delete_msg", %{message_id: message.id}
    assert_reply ref2, :ok, %{id: message_id}
    assert message_id == message.id

    assert_broadcast "delete_msg", %{id: message_id}
    assert message_id == message.id
    refute Repo.get(Message, message.id)
  end
end
