defmodule StitchConnect.Web.EventsTest do
  use StitchConnect.Web.ChannelCase

  setup [:create_users, :connect_socket, :create_group]

  test "group participants receives message event",
      %{socket1: socket1, user1: user1, user2: user2, group: group} do
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    @endpoint.subscribe("events:#{user2.id}")

    push socket1, "new_msg", %{text_content: "Hello, World!"}

    assert_broadcast "new_message", data

    assert data.user_id == user1.id
    assert data.text_content == "Hello, World!"
  end
end
