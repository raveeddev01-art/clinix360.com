defmodule StitchConnect.Web.ChannelDmTest do
  use StitchConnect.Web.ChannelCase
  alias StitchConnect.Web.UserSocket
  alias Stitch.Group

  setup [:create_users, :connect_socket]

  test "DM channels can be joined even without group",
      %{socket1: socket1, user1: user1, user2: user2} do
    ids_pair = [user1.id, user2.id] |> Enum.sort |> Enum.join(".")
    assert {:ok, _, _} = subscribe_and_join(socket1, "groups:__dm:#{ids_pair}")
  end

  test "DM group created on first dm message",
      %{socket1: socket1, user1: user1, user2: user2} do
    ids_pair = [user1.id, user2.id] |> Enum.sort |> Enum.join(".")
    group_slug = "__dm:#{ids_pair}"
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:__dm:#{ids_pair}")

    refute Repo.get_by(Group, slug: group_slug)

    ref = push socket1, "group.new_message", %{text_content: "Hello, My Friend!"}
    assert_reply ref, :ok, reply

    group = Repo.get_by(Group, slug: group_slug)

    assert group
    assert group.id == reply.group_id
  end

  test "same DM group used on future messages",
      %{socket1: socket1, user1: user1, user2: user2} do
    ids_pair = [user1.id, user2.id] |> Enum.sort |> Enum.join(".")
    group_slug = "__dm:#{ids_pair}"

    {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
    {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{group_slug}")
    {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group_slug}")

    ref1 = push socket1, "group.new_message", %{text_content: "Hello, My Friend!"}
    assert_reply ref1, :ok, reply1

    ref2 = push socket2, "group.new_message", %{text_content: "Hello, Hello"}
    assert_reply ref2, :ok, reply2

    assert reply1.group_id == reply2.group_id
    assert Repo.get(Group, reply1.group_id).slug == group_slug
  end
end
