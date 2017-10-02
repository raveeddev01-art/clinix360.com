defmodule StitchConnect.Web.TeamChannelTest do
  use StitchConnect.Web.ChannelCase

  setup [:create_users, :connect_socket]

  test "join is successful when the team ID in the topic is correct",
      %{user1: user1, socket1: socket1} do
    assert {:ok, %{}, %Phoenix.Socket{}} = join(socket1, "team:lobby:#{user1.team_id}")
  end

  test "receive an error when team ID in channel topic doesn't match user's team ID",
      %{user1: user1, socket1: socket1} do
    {:error, reply} = join(socket1, "team:lobby:#{user1.team_id + 1}")
    assert reply == %{message: "Unauthorized"}
  end
end
