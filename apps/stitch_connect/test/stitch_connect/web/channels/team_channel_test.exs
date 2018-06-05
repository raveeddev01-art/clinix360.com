defmodule Stitch.Web.TeamChannelTest do
  use Stitch.Web.ChannelCase

  setup [:create_users, :connect_socket]

  test "join is successful when the team ID in the topic is correct", %{
    user1: user1,
    socket1: socket1
  } do
    assert {:ok, %{}, %Phoenix.Socket{}} = join(socket1, "team:lobby:#{user1.team_id}")
  end

  test "receive an error when team ID in channel topic doesn't match user's team ID", %{
    user1: user1,
    socket1: socket1
  } do
    {:error, reply} = join(socket1, "team:lobby:#{user1.team_id + 1}")
    assert reply == %{message: "Unauthorized"}
  end

  test "get_lockout_settings", %{user1: user1, socket1: socket1} do
    {:ok, _, socket1} = join(socket1, "team:lobby:#{user1.team_id}")
    Stitch.Team.Admin.update_security_lockout_time(user1.team_id, true, 42)

    ref = push(socket1, "get_lockout_settings", %{})

    assert_reply(ref, :ok, %{security_lockout_enabled: true, seconds_to_lockout: 42})
  end

  test "updates user's time zone", %{user1: user1, socket1: socket1} do
    timezone = %{
      "tz" => "America/Los_Angeles",
      "tz_label" => "Pacific Daylight Time",
      "tz_offset" => -25200
    }

    assert {:ok, %{}, %Phoenix.Socket{}} =
             join(socket1, "team:lobby:#{user1.team_id}", %{
               "timezone" => timezone
             })

    assert Stitch.Repo.get(Stitch.Accounts.User, user1.id).timezone == timezone
  end
end
