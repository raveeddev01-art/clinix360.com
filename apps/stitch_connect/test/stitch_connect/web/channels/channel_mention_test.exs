defmodule StitchConnect.Web.ChannelMentionTest do
  use StitchConnect.Web.ChannelCase
  alias StitchConnect.Web.UserSocket
  alias Stitch.Message

  setup [:create_users, :connect_socket, :create_group]

  describe "new message" do
    test "user's mention counter is broadcasted when his is mentioned in the message", %{socket1: socket1, group: group, user2: user2} do
      {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
      {:ok, _, _socket2} = subscribe_and_join(socket2, "groups:#{group.slug}")

      @endpoint.subscribe("events:#{user2.id}")

      push socket1, "new_msg", %{text_content: "Mentions @#{user2.username}."}

      assert_broadcast "mentions_count", %{group_id: group_id, mentions_count: 1}
      assert group_id == group.id
    end
  end

  describe "edit message" do
  end

  describe "delete message" do
  end

  describe "read message" do
  end
end
