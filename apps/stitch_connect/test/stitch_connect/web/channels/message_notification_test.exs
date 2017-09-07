defmodule StitchConnect.Web.ChannelNotificationTest do
  use StitchConnect.Web.ChannelCase
  alias StitchConnect.Web.UserSocket

  setup [:create_users, :connect_socket, :create_group]

  describe "users that are active on the target group aren't notified" do
    test "user is online but has another group open", %{socket1: socket1, group: group, user2: user2} do
      {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
      {:ok, _, socket2_g} = subscribe_and_join(socket2, "groups:#{group.slug}")
      {:ok, _, socket2_t} = subscribe_and_join(socket2, "team:lobby:#{group.team_id}")

      push socket2_t, "current_group_update", %{"current_group" => "random"}
      @endpoint.subscribe("events:#{user2.id}")
      push socket1, "new_msg", %{text_content: "Mentions @#{user2.username}."}

      assert_broadcast "new_message", %{group_id: group_id, text_content: "Mentions @user2.", notify: true}
    end

    test "user has the target group open but is away", %{socket1: socket1, group: group, user2: user2} do
      {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
      {:ok, _, socket2_g} = subscribe_and_join(socket2, "groups:#{group.slug}")
      {:ok, _, socket2_t} = subscribe_and_join(socket2, "team:lobby:#{group.team_id}")

      push socket2_t, "status_update", %{"status" => "away"}
      @endpoint.subscribe("events:#{user2.id}")
      push socket1, "new_msg", %{text_content: "Mentions @#{user2.username}."}

      assert_broadcast "new_message", %{group_id: group_id, text_content: "Mentions @user2.", notify: true}
    end

    test "user has the target group open and is online", %{socket1: socket1, group: group, user2: user2} do
      {:ok, _, socket1} = subscribe_and_join(socket1, "groups:#{group.slug}")
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
      {:ok, _, socket2_g} = subscribe_and_join(socket2, "groups:#{group.slug}")
      {:ok, _, socket2_t} = subscribe_and_join(socket2, "team:lobby:#{group.team_id}")

      push socket2_t, "current_group_update", %{"current_group" => group.slug}
      push socket2_t, "status_update", %{"status" => "online"}
      @endpoint.subscribe("events:#{user2.id}")
      push socket1, "new_msg", %{text_content: "Mentions @#{user2.username}."}

      refute_broadcast "new_message", %{group_id: group_id, text_content: "Mentions @user2.", notify: true}
    end
  end
end
