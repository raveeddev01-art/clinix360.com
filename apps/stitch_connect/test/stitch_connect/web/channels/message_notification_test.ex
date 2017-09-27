defmodule StitchConnect.Web.ChannelNotificationTest do
  use StitchConnect.Web.ChannelCase
  alias StitchConnect.Web.UserSocket

  setup [:create_users, :connect_socket, :create_group, :create_dm]

  describe "regular channel" do
    test "user is away", %{socket1: socket1, group: group, user2: user2} do
      {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
      {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{group.slug}")
      {:ok, _, socket2} = subscribe_and_join(socket2, "team:lobby:#{group.team_id}")

      push socket2, "activity", %{"is_active" => false}
      @endpoint.subscribe("events:#{user2.id}")
      push socket1, "new_msg", %{text_content: "Mentions @#{user2.username}."}

      assert_broadcast "new_message", %{group_id: _group_id, text_content: "Mentions @user2.", notify: true}
    end

    test "user is online", %{socket1: socket1, group: group, user2: user2} do
      {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
      {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{group.slug}")
      {:ok, _, socket2} = subscribe_and_join(socket2, "team:lobby:#{group.team_id}")

      push socket2, "activity", %{"status" => true}
      @endpoint.subscribe("events:#{user2.id}")
      push socket1, "new_msg", %{text_content: "Mentions @#{user2.username}."}

      refute_broadcast "new_message", %{group_id: _group_id, text_content: "Mentions @user2.", notify: true}
    end
  end

  describe "direct message" do
    test "user has the target group open but is away", %{socket1: socket1, user2: user2, dm_group: dm_group} do
      {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{dm_group.slug}")
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
      {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{dm_group.slug}")
      {:ok, _, socket2} = subscribe_and_join(socket2, "team:lobby:#{dm_group.team_id}")

      push socket2, "activity", %{"is_active" => false}
      @endpoint.subscribe("events:#{user2.id}")
      push socket1, "new_msg", %{text_content: "Lorem ipsum"}

      assert_broadcast "new_message", %{text_content: "Lorem ipsum", notify: true}
    end

    test "user is online but has the target group open", %{socket1: socket1, user2: user2, dm_group: dm_group} do
      {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{dm_group.slug}")
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
      {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{dm_group.slug}")
      {:ok, _, socket2} = subscribe_and_join(socket2, "team:lobby:#{dm_group.team_id}")

      @endpoint.subscribe("events:#{user2.id}")
      push socket1, "new_msg", %{text_content: "Lorem ipsum"}

      refute_broadcast "new_message", %{group_id: _dm_group_id, text_content: "Lorem ipsum", notify: true}
    end
  end


  describe "multi-direct message" do
    test "user is away", %{socket1: socket1, user2: user2, dm_group: dm_group} do
      {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{dm_group.slug}")
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
      {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{dm_group.slug}")
      {:ok, _, socket2} = subscribe_and_join(socket2, "team:lobby:#{dm_group.team_id}")

      push socket2, "activity", %{"is_active" => false}
      @endpoint.subscribe("events:#{user2.id}")
      push socket1, "new_msg", %{text_content: "Lorem ipsum"}

      assert_broadcast "new_message", %{group_id: _dm_group_id, text_content: "Lorem ipsum", notify: true}
    end

    test "user is online", %{socket1: socket1, user2: user2, dm_group: dm_group} do
      {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{dm_group.slug}")
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
      {:ok, _, socket2} = subscribe_and_join(socket2, "groups:#{dm_group.slug}")
      {:ok, _, socket2} = subscribe_and_join(socket2, "team:lobby:#{dm_group.team_id}")

      @endpoint.subscribe("events:#{user2.id}")
      push socket1, "new_msg", %{text_content: "Lorem ipsum"}

      refute_broadcast "new_message", %{group_id: _dm_group_id, text_content: "Lorem ipsum", notify: true}
    end
  end
end
