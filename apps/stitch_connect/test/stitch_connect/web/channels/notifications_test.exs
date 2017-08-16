defmodule StitchConnect.Web.NotificationsTest do
  use StitchConnect.Web.ChannelCase

  setup [:create_users, :connect_socket, :create_group]

  test "group participants receives message notification",
      %{socket1: socket1, user1: user1, user2: user2, group: group} do
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    @endpoint.subscribe("notifications:#{user2.id}")

    push socket1, "new_msg", %{text_content: "Hello, World!"}

    assert_broadcast "new_message", data

    assert data.user_id == user1.id
    assert data.text_content == "Hello, World!"
  end
end
