defmodule StitchConnect.Web.ChannelNotificationTest do
  use StitchConnect.Web.ChannelCase
  alias StitchConnect.Web.UserSocket

  setup [:create_users, :connect_socket, :create_group, :create_dm]

  describe "regular channel" do
    test "user is inactive", %{socket1: socket1, group: group, user2: user2} do
      socket1 = subscribe_and_join!(socket1, "groups:#{group.slug}")
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})

      socket2 =
        socket2
        |> subscribe_and_join!("groups:#{group.slug}")
        |> subscribe_and_join!("team:lobby:#{group.team_id}")

      push socket2, "became_inactive", %{}
      @endpoint.subscribe("events:#{user2.id}")
      ref = push socket1, "new_message", %{text_content: "Mentions @#{user2.username}."}
      assert_reply ref, :ok
      assert_broadcast "new_message", %{group_id: _group_id, text_content: "Mentions @user2.", notify: true}
      assert Stitch.EmailNotification.count([user2.id]) == [%{message_count: 1, user_id: user2.id}]
    end

    test "user is inactive and isn't mentioned in the message", %{socket1: socket1, group: group, user2: user2} do
      socket1 = subscribe_and_join!(socket1, "groups:#{group.slug}")
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})

      socket2 =
        socket2
        |> subscribe_and_join!("groups:#{group.slug}")
        |> subscribe_and_join!("team:lobby:#{group.team_id}")

      push socket2, "became_inactive", %{}
      @endpoint.subscribe("events:#{user2.id}")
      ref = push socket1, "new_message", %{text_content: "Doesn't mention anyone}."}
      assert_reply ref, :ok
      assert Stitch.EmailNotification.count([user2.id]) == []
    end

    test "user is active", %{socket1: socket1, group: group, user2: user2} do
      socket1 = subscribe_and_join!(socket1, "groups:#{group.slug}")
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})

      socket2 =
        socket2
        |> subscribe_and_join!("groups:#{group.slug}")
        |> subscribe_and_join!("team:lobby:#{group.team_id}")

      push socket2, "became_active", %{}
      @endpoint.subscribe("events:#{user2.id}")

      ref = push socket1, "new_message", %{text_content: "Mentions @#{user2.username}."}
      assert_reply ref, :ok

      refute_broadcast "new_message", %{group_id: _group_id, text_content: "Mentions @user2.", notify: true}
      assert Stitch.EmailNotification.count([user2.id]) == []
    end
  end

  describe "direct message" do
    test "user is inactive", %{socket1: socket1, user2: user2, dm_group: dm_group} do
      socket1 = subscribe_and_join!(socket1, "groups:#{dm_group.slug}")
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})

      socket2 =
        socket2
        |> subscribe_and_join!("groups:#{dm_group.slug}")
        |> subscribe_and_join!("team:lobby:#{dm_group.team_id}")

      push socket2, "became_inactive", %{}
      @endpoint.subscribe("events:#{user2.id}")
      ref = push socket1, "new_message", %{text_content: "Lorem ipsum"}
      assert_reply ref, :ok

      assert_broadcast "new_message", %{text_content: "Lorem ipsum", notify: true}
      assert Stitch.EmailNotification.count([user2.id]) == [%{message_count: 1, user_id: user2.id}]
    end

    test "user is active", %{socket1: socket1, user2: user2, dm_group: dm_group} do
      socket1 = subscribe_and_join!(socket1, "groups:#{dm_group.slug}")
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})

      socket2
      |> subscribe_and_join!("groups:#{dm_group.slug}")
      |> subscribe_and_join!("team:lobby:#{dm_group.team_id}")

      @endpoint.subscribe("events:#{user2.id}")
      ref = push socket1, "new_message", %{text_content: "Lorem ipsum"}
      assert_reply ref, :ok

      refute_broadcast "new_message", %{group_id: _dm_group_id, text_content: "Lorem ipsum", notify: true}
      assert Stitch.EmailNotification.count([user2.id]) == []
    end
  end

  describe "multi-direct message" do
    test "user is inactive", %{socket1: socket1, user2: user2, dm_group: dm_group} do
      socket1 = subscribe_and_join!(socket1, "groups:#{dm_group.slug}")
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})

      socket2 =
        socket2
        |> subscribe_and_join!("groups:#{dm_group.slug}")
        |> subscribe_and_join!("team:lobby:#{dm_group.team_id}")

      push socket2, "became_inactive", %{}
      @endpoint.subscribe("events:#{user2.id}")
      ref = push socket1, "new_message", %{text_content: "Lorem ipsum"}
      assert_reply ref, :ok

      assert_broadcast "new_message", %{group_id: _dm_group_id, text_content: "Lorem ipsum", notify: true}
      assert Stitch.EmailNotification.count([user2.id]) == [%{message_count: 1, user_id: user2.id}]
    end

    test "user is active", %{socket1: socket1, user2: user2, dm_group: dm_group} do
      socket1 = subscribe_and_join!(socket1, "groups:#{dm_group.slug}")
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})

      socket2
      |> subscribe_and_join!("groups:#{dm_group.slug}")
      |> subscribe_and_join!("team:lobby:#{dm_group.team_id}")

      @endpoint.subscribe("events:#{user2.id}")
      ref = push socket1, "new_message", %{text_content: "Lorem ipsum"}
      assert_reply ref, :ok

      refute_broadcast "new_message", %{group_id: _dm_group_id, text_content: "Lorem ipsum", notify: true}
      assert Stitch.EmailNotification.count([user2.id]) == []
    end
  end
end
