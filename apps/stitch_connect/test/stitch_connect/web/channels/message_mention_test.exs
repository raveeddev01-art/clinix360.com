defmodule StitchConnect.Web.ChannelMentionTest do
  use StitchConnect.Web.ChannelCase
  alias StitchConnect.Web.UserSocket
  alias Stitch.Message

  setup [:create_users, :connect_socket, :create_group]

  describe "new message" do
    test "user's mention counter is broadcasted when he is mentioned in the message", %{socket1: socket1, group: group, user2: user2} do
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
    test "user's mention counter is broadcasted when he is mentioned in the new message edit", %{socket1: socket1, group: group, user2: user2} do
      {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
      {:ok, _, _socket2} = subscribe_and_join(socket2, "groups:#{group.slug}")

      @endpoint.subscribe("events:#{user2.id}")

      ref1 = push socket1, "new_msg", %{text_content: "Doesn't mention anyone."}
      assert_reply ref1, :ok, %{id: message_id}

      refute_broadcast "mentions_count", %{group_id: group_id}

      push socket1, "edit_msg", %{message_id: message_id, params: %{text_content: "Mentions @#{user2.username}."}}
      assert_broadcast "mentions_count", %{group_id: group_id, mentions_count: 1}
    end

    test "user's mention counter is broadcasted when he is no longer mentioned in the new message edit", %{socket1: socket1, group: group, user2: user2} do
      {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
      {:ok, _, _socket2} = subscribe_and_join(socket2, "groups:#{group.slug}")

      @endpoint.subscribe("events:#{user2.id}")

      ref1 = push socket1, "new_msg", %{text_content: "Mentions @#{user2.username}."}
      assert_reply ref1, :ok, %{id: message_id}

      assert_broadcast "mentions_count", %{group_id: group_id, mentions_count: 1}

      push socket1, "edit_msg", %{message_id: message_id, params: %{text_content: "Doesn't mention anyone."}}
      assert_broadcast "mentions_count", %{group_id: group_id, mentions_count: 0}
    end
  end

  describe "delete message" do
    test "user's mention counter is broadcasted when an unread message that mentions him is deleted", %{socket1: socket1, group: group, user2: user2} do
      {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
      {:ok, _, _socket2} = subscribe_and_join(socket2, "groups:#{group.slug}")

      @endpoint.subscribe("events:#{user2.id}")

      ref1 = push socket1, "new_msg", %{text_content: "Mentions @#{user2.username}."}
      assert_reply ref1, :ok, %{id: message_id}

      assert_broadcast "mentions_count", %{group_id: group_id, mentions_count: 1}

      ref3 = push socket1, "delete_msg", %{message_id: message_id}

      assert_broadcast "mentions_count", %{group_id: group_id, mentions_count: 0}
    end
  end

  describe "read message" do
    test "user's mention counter is broadcasted when he reads messages that mention him", %{socket1: socket1, group: group, user2: user2} do
      {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
      {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{group.slug}")

      @endpoint.subscribe("events:#{user2.id}")

      ref1 = push socket1, "new_msg", %{text_content: "Mentions @#{user2.username}."}
      ref2 = push socket1, "new_msg", %{text_content: "Mentions @#{user2.username} second time."}
      assert_reply ref1, :ok, %{id: message_a_id}
      assert_reply ref2, :ok, %{id: message_b_id}

      assert_broadcast "mentions_count", %{group_id: group_id, mentions_count: 1}
      assert_broadcast "mentions_count", %{group_id: group_id, mentions_count: 2}

      push socket2, "mark_as_read", %{message_ids: [message_a_id, message_b_id]}

      assert_broadcast "mentions_count", %{group_id: group_id, mentions_count: 0}
    end
  end
end
