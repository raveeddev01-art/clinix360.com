defmodule StitchConnect.Web.ChannelFeedTest do
  use StitchConnect.Web.ChannelCase
  alias Stitch.Message

  setup [:create_users, :connect_socket, :create_group]

  test "channel returns last 60 message reversed when joined", %{
    socket1: socket1,
    group: group,
    user2: user2
  } do
    for n <- 1..90 do
      attrs = %{user_id: user2.id, group_id: group.id, text_content: "Message ##{n}"}
      %Message{} |> Message.changeset(attrs) |> Repo.insert()
    end

    assert {:ok, reply, _} = subscribe_and_join(socket1, "groups:#{group.slug}")

    assert length(reply.messages) == 60

    latest = List.first(reply.messages)
    assert latest.text_content == "Message #90"
    assert latest.user_id == user2.id
    assert latest.group_id == group.id
  end

  test "feed event returns last 60 message before given id", %{
    socket1: socket1,
    group: group,
    user2: user2
  } do
    messages =
      1..140
      |> Enum.map(fn n ->
        attrs = %{user_id: user2.id, group_id: group.id, text_content: "Message ##{n}"}
        %Message{} |> Message.changeset(attrs) |> Repo.insert!()
      end)

    [mid | older] = Enum.take(messages, 61) |> Enum.reverse()

    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    ref = push(socket1, "feed", %{max_id: mid.id})
    assert_reply(ref, :ok, reply)

    assert length(reply.messages) == 60

    assert List.first(reply.messages).id == List.first(older).id
  end

  test "feed_recent event returns 60 messages after given id", %{
    socket1: socket1,
    group: group,
    user2: user2
  } do
    messages =
      1..140
      |> Enum.map(fn n ->
        attrs = %{user_id: user2.id, group_id: group.id, text_content: "Message ##{n}"}
        %Message{} |> Message.changeset(attrs) |> Repo.insert!()
      end)

    [mid | newer] = Enum.drop(messages, 61)

    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    ref = push(socket1, "feed_recent", %{min_id: mid.id})
    assert_reply(ref, :ok, reply)

    assert length(reply.messages) == 60

    Enum.each(0..59, fn idx ->
      assert Enum.at(reply.messages, idx).id == Enum.at(newer, idx).id
    end)
  end

  describe "feed_surrounding" do
    setup %{socket1: socket, group: group, user2: user} do
      messages =
        1..150
        |> Enum.map(fn n ->
          insert(:message, user: user, group: group, text_content: "Message ##{n}")
        end)

      {:ok, _, socket} = subscribe_and_join(socket, "groups:#{group.slug}")
      {:ok, messages: messages, socket: socket}
    end

    test "when there are 60 more messages before and after the target id", %{
      socket: socket,
      messages: messages
    } do
      [mid_message] = Enum.slice(messages, 65..65)
      ref = push(socket, "feed_surrounding", %{id: mid_message.id})

      assert_reply(ref, :ok, reply)
      assert reply.more_after == true
      assert reply.more_before == true

      expected_message_ids = messages |> Enum.slice(5..125) |> Enum.map(& &1.id)
      assert Enum.map(reply.messages, & &1.id) == expected_message_ids
    end

    test "when there are less than 60 messages before the target id", %{
      socket: socket,
      messages: messages
    } do
      first_message = messages |> Enum.at(10)

      ref = push(socket, "feed_surrounding", %{id: first_message.id})

      assert_reply(ref, :ok, reply)
      assert reply.more_after == true
      assert reply.more_before == false
      expected_message_ids = messages |> Enum.slice(0..70) |> Enum.map(& &1.id)

      assert Enum.map(reply.messages, & &1.id) == expected_message_ids
    end

    test "when there are no messages before the target id", %{socket: socket, messages: messages} do
      first_message = messages |> List.first()

      ref = push(socket, "feed_surrounding", %{id: first_message.id})

      assert_reply(ref, :ok, reply)
      assert reply.more_after == true
      assert reply.more_before == false
      expected_message_ids = messages |> Enum.slice(0..60) |> Enum.map(& &1.id)

      assert Enum.map(reply.messages, & &1.id) == expected_message_ids
    end

    test "when there are no messages after the target id", %{socket: socket, messages: messages} do
      last_message = messages |> List.last()

      ref = push(socket, "feed_surrounding", %{id: last_message.id})

      assert_reply(ref, :ok, reply)
      assert reply.more_after == false
      assert reply.more_before == true
      expected_message_ids = messages |> Enum.slice(89..150) |> Enum.map(& &1.id)

      assert Enum.map(reply.messages, & &1.id) == expected_message_ids
    end

    test "when there are less than 60 messages after the target id", %{
      socket: socket,
      messages: messages
    } do
      last_message = messages |> Enum.at(149)

      ref = push(socket, "feed_surrounding", %{id: last_message.id})

      assert_reply(ref, :ok, reply)
      assert reply.more_after == false
      assert reply.more_before == true
      expected_message_ids = messages |> Enum.slice(89..150) |> Enum.map(& &1.id)

      assert Enum.map(reply.messages, & &1.id) == expected_message_ids
    end

    test "when target message doesn't exist", %{socket: socket} do
      ref = push(socket, "feed_surrounding", %{id: 1_000_042})
      assert_reply(ref, :error, reply)
      assert reply.message == "Message not found."
    end
  end
end