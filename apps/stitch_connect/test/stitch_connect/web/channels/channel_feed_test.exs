defmodule StitchConnect.Web.ChannelFeedTest do
  use StitchConnect.Web.ChannelCase
  alias Stitch.Message

  setup [:create_users, :connect_socket, :create_group]

  test "channel returns last 30 message reversed when joined",
      %{socket1: socket1, group: group, user2: user2} do

    for n <- 1..40 do
      attrs = %{user_id: user2.id, group_id: group.id, text_content: "Message ##{n}"}
      %Message{} |> Message.changeset(attrs) |> Repo.insert
    end

    assert {:ok, reply, _} = subscribe_and_join(socket1, "groups:#{group.slug}")

    assert length(reply.messages) == 30

    latest = List.first(reply.messages)
    assert latest.text_content == "Message #40"
    assert latest.user_id == user2.id
    assert latest.group_id == group.id
  end

  test "feed event returns last 30 message before given id",
      %{socket1: socket1, group: group, user2: user2}  do

    messages = 1..100 |> Enum.map(fn n ->
      attrs = %{user_id: user2.id, group_id: group.id, text_content: "Message ##{n}"}
      %Message{} |> Message.changeset(attrs) |> Repo.insert!
    end)
    [mid | older] = Enum.take(messages, 50) |> Enum.reverse

    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")

    ref = push socket1, "feed", %{max_id: mid.id}
    assert_reply ref, :ok, reply

    assert length(reply.messages) == 30

    assert List.first(reply.messages).id == List.first(older).id
  end
end
