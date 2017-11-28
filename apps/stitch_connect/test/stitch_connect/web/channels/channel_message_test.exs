defmodule StitchConnect.Web.ChannelMessageTest do
  use StitchConnect.Web.ChannelCase
  alias StitchConnect.Web.UserSocket
  alias Stitch.Message

  setup [:create_users, :connect_socket, :create_group]

  test "new_message event returns creates message and returns it", %{socket1: socket1, group: group} do
    uniq_content = Ecto.UUID.generate

    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    refute Repo.get_by(Message, text_content: uniq_content)

    ref = push socket1, "group.new_message", %{text_content: uniq_content}
    assert_reply ref, :ok, reply

    message = Repo.get_by(Message, text_content: uniq_content)

    assert message
    assert reply.id == message.id
    assert reply.text_content == uniq_content
  end

  test "new_message event broadcasts new message to other channel members",
      %{socket1: socket1, user1: user1, group: group} do
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    @endpoint.subscribe("groups:#{group.slug}")

    ref = push socket1, "group.new_message", %{text_content: "Hello, World!"}
    assert_reply ref, :ok

    assert_broadcast "group.new_message", data

    assert data.user_id == user1.id
    assert data.text_content == "Hello, World!"
  end

  test "new_message's temporary request_id is included in the reply and broadcast event",
      %{socket1: socket1, user1: user1, group: group} do
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    @endpoint.subscribe("groups:#{group.slug}")

    ref = push socket1, "group.new_message", %{text_content: "Hello, World!", request_id: "some temporary ID"}

    assert_reply ref, :ok, reply
    assert reply.text_content == "Hello, World!"
    assert reply.request_id == "some temporary ID"

    assert_push "group.new_message", data

    assert data.user_id == user1.id
    assert data.text_content == "Hello, World!"
    assert data.request_id == "some temporary ID"
  end

  test "message can be deleted or edited only by author",
      %{socket1: socket1, user2: user2, group: group} do
    {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
    {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{group.slug}")
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    ref1 = push socket1, "group.new_message", %{text_content: "Hello, World!"}
    assert_reply ref1, :ok, message

    ref2 = push socket2, "group.change_message", %{message_id: message.id, params: %{text_content: "New Content"}}
    assert_reply ref2, :error, %{message: "Message not found."}

    ref3 = push socket2, "group.delete_message", %{message_id: message.id}
    assert_reply ref3, :error, %{message: "Message not found."}
  end

  test "change_message event changes message content and broadcasts it",
      %{socket1: socket1, group: group} do
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    ref1 = push socket1, "group.new_message", %{text_content: "Hello, World!"}
    assert_reply ref1, :ok, message

    @endpoint.subscribe("groups:#{group.slug}")

    ref2 = push socket1, "group.change_message", %{message_id: message.id, params: %{text_content: "New Content"}}
    assert_reply ref2, :ok, edited_message

    assert message.id == edited_message.id
    assert Repo.get(Message, message.id).text_content == "New Content"

    assert_broadcast "group.change_message", data
    assert data.id == edited_message.id
    assert data.text_content == edited_message.text_content
  end

  test "group.delete_message event deletes message and broadcasts it's id",
      %{socket1: socket1, group: group} do
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    ref1 = push socket1, "group.new_message", %{text_content: "Hello, World!"}
    assert_reply ref1, :ok, message

    @endpoint.subscribe("groups:#{group.slug}")

    ref2 = push socket1, "group.delete_message", %{message_id: message.id}
    assert_reply ref2, :ok, %{id: message_id}
    assert message_id == message.id

    assert_broadcast "group.delete_message", %{id: message_id}
    assert message_id == message.id
    refute Repo.get(Message, message.id)
  end

  test "group.delete_message_link_preview event deletes link preview and broadcasts it",
      %{socket1: socket1, user1: user1, group: group} do
    message = insert :message,
      user: user1,
      group: group,
      link_previews: [%{link: "http://foo.bar", title: "Foobar"}]

    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")
    @endpoint.subscribe("groups:#{group.slug}")

    ref = push socket1, "group.delete_message_link_preview", %{message_id: message.id, link: "http://foo.bar"}

    assert_reply ref, :ok
    assert_broadcast "msg_link_preview_deleted", %{message_id: message_id, link: link}
    assert message_id == message.id
    assert link == "http://foo.bar"
  end

  test "group.delete_message_link_preview event only allows message author or admins to delete link preview",
      %{socket1: socket1, user1: user1, user2: user2, group: group} do
    {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
    {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{group.slug}")
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    message1 = insert :message,
      user: user1,
      group: group,
      link_previews: [%{link: "http://foo.bar", title: "Foobar"}]

    ref = push socket2, "group.delete_message_link_preview", %{message_id: message1.id, link: "http://foo.bar"}
    assert_reply ref, :error, %{message: "Only the message sender or an admin can delete a message's link preview."}

    message2 = insert :message,
      user: user2,
      group: group,
      link_previews: [
        %{link: "http://foo.com", title: "Foo"},
        %{link: "http://bar.com", title: "Bar"},
      ]

    ref = push socket2, "group.delete_message_link_preview", %{message_id: message2.id, link: "http://foo.com"}
    assert_reply ref, :ok

    ref = push socket1, "group.delete_message_link_preview", %{message_id: message2.id, link: "http://bar.com"}
    assert_reply ref, :ok
  end
end
