defmodule Stitch.AnalyticsTest do
  use Stitch.DataCase
  alias Stitch.Analytics

  describe "identify_and_group/1" do
    test "identify_and_group/1 with user" do
      subscription = insert(:subscription)
      team = insert(:team, subscription: subscription)
      user = insert(:user, team: team)

      :ok = Analytics.identify_and_group(user)

      events = Analytics.list_events()

      assert length(events) == 2

      identify_request = Enum.find(events, &(&1.payload["type"] == "identify"))
      group_request = Enum.find(events, &(&1.payload["type"] == "group"))
      identify_payload = identify_request.payload
      group_payload = group_request.payload

      expected_identify_traits = %{
        "email"     => user.email,
        "team_name" => team.name,
        "team_slug" => team.slug,
        "team_id"   => Integer.to_string(team.id),
        "plan"      => subscription.tier,
        "status"    => "enabled"
      }

      assert identify_payload["type"] == "identify"
      assert identify_payload["userId"] == Integer.to_string(user.id)
      assert identify_payload["traits"] == expected_identify_traits
      assert identify_payload["timestamp"]

      expected_group_traits = %{
        "team_name" => team.name,
        "team_slug" => team.slug,
        "team_id"   => Integer.to_string(team.id),
        "plan"      => subscription.tier,
      }

      assert group_payload["type"] == "group"
      assert group_payload["userId"] == Integer.to_string(user.id)
      assert group_payload["traits"] == expected_group_traits
      assert group_payload["timestamp"]
    end

    test "identify_and_group/1 with team" do
      subscription = insert(:subscription)
      team = insert(:team, subscription: subscription)
      insert(:user, team: team)
      insert(:user, team: team)

      :ok = Analytics.identify_and_group(team)

      events = Analytics.list_events()

      assert length(events) == 4

      identify_request = Enum.filter(events, &(&1.payload["type"] == "identify"))
      group_request = Enum.filter(events, &(&1.payload["type"] == "group"))

      assert length(identify_request) == 2
      assert length(group_request) == 2
    end
  end

  test "identify/1 creates event record with correct payload" do
    subscription = insert(:subscription)
    team = insert(:team, subscription: subscription)
    user = insert(:user, team: team)

    Analytics.identify(user)

    [%{payload: payload}] = Analytics.list_events()

    expected_identify_traits = %{
      "email"     => user.email,
      "team_name" => team.name,
      "team_slug" => team.slug,
      "team_id"   => Integer.to_string(team.id),
      "plan"      => subscription.tier,
      "status"    => "enabled"
    }

    assert payload["type"] == "identify"
    assert payload["userId"] == Integer.to_string(user.id)
    assert payload["traits"] == expected_identify_traits
    assert payload["timestamp"]
  end

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
