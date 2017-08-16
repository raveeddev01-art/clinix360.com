defmodule StitchConnect.Web.ChannelMessageTest do
  use StitchConnect.Web.ChannelCase
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
end
