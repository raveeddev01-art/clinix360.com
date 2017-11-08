defmodule Stitch.AnalyticsTest do
  use Stitch.DataCase
  alias Stitch.Analytics

  test "identify/2 creates event record with correct payload" do
    user_id = 1234
    traits = %{"email" => "some email"}

    Analytics.identify(user_id, traits)

    [%{payload: payload}] = Analytics.list_events()

    assert payload["type"] == "identify"
    assert payload["userId"] == Integer.to_string(user_id)
    assert payload["traits"] == traits
    assert payload["timestamp"]
  end

  test "group/2 creates event record with correct payload" do
    team_id = 1234
    user_id = 5678
    traits = %{"team_name" => "some name"}

    Analytics.group(%{user_id: user_id, team_id: team_id}, traits)

    [%{payload: payload}] = Analytics.list_events()

    assert payload["type"] == "group"
    assert payload["userId"] == Integer.to_string(user_id)
    assert payload["groupId"] == Integer.to_string(team_id)
    assert payload["traits"] == traits
    assert payload["timestamp"]
  end

  test "track/3 creates event record with correct payload" do
    user_id = 5678
    event = "some event"
    properties = %{
      "room_id"   => "some name",
      "room_slug" => "some room slug",
      "team_id"   => "some team id",
      "team_slug" => "some team slug"
    }

    Analytics.track(user_id, event, properties)

    [%{payload: payload}] = Analytics.list_events()

    assert payload["type"] == "track"
    assert payload["userId"] == Integer.to_string(user_id)
    assert payload["event"] == event
    assert payload["properties"] == properties
    assert payload["timestamp"]
  end

end
