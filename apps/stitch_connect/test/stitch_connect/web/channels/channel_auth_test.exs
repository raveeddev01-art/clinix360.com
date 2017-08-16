defmodule StitchConnect.Web.ChannelAuthTest do
  use StitchConnect.Web.ChannelCase
  alias StitchConnect.Web.UserSocket

  describe "connecting to socket with token" do
    test "connection denied with incorrect token" do
      assert connect(UserSocket, %{"authenticationToken" => "abc"}) == :error
    end

    test "connection successful with correct token" do
      user = Stitch.Accounts.create_user_with_email_only("user@mail.com")

      assert {:ok, _} = connect(UserSocket, %{"authenticationToken" => user.token})
    end

    test "current user assigned in socket" do
      user = Stitch.Accounts.create_user_with_email_only("user@mail.com")

      {:ok, socket} = connect(UserSocket, %{"authenticationToken" => user.token})

      assert socket.assigns.current_user.id == user.id
    end
  end

  describe "joining group channels" do
    setup [:create_users, :connect_socket, :create_private_group]

    test "anyone can join public groups", %{socket1: socket1} do
      assert {:ok, _, _} = subscribe_and_join(socket1, "groups:general")
    end

    test "only members can leave message on public groups", %{socket1: socket1} do
      assert {:ok, _, socket1} = subscribe_and_join(socket1, "groups:general")

      ref = push socket1, "new_msg", %{text_content: "Hello, I'm not member"}

      assert_reply ref, :error, reply
      assert %{message: "Only members can write messages."} == reply
    end

    test "only existing groups can be joined", %{socket1: socket1} do
      {:error, error} = subscribe_and_join(socket1, "groups:blah")
      assert %{message: "group not found"} == error
    end

    test "only members can join private groups", %{socket1: socket1, group1: group1, user2: user2} do
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
      {:error, error2} = subscribe_and_join(socket2, "groups:#{group1.slug}")
      assert %{message: "unauthorized"} == error2

      assert {:ok, _, _} = subscribe_and_join(socket1, "groups:#{group1.slug}")
    end
  end

  describe "joining notifications channel" do
    setup [:create_users, :connect_socket, :create_private_group]

    test "user can join only own notifications channel", %{socket1: socket1, user1: user1} do
      assert {:ok, _, socket1} = subscribe_and_join(socket1, "notifications:#{user1.id}")

      {:error, error} = subscribe_and_join(socket1, "notifications:#{user1.id + 1}")
      assert %{message: "Unauthorized"} == error
    end
  end
end
