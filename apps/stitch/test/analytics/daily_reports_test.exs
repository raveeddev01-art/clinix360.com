defmodule Stitch.Analytics.DailyReportsTest do
  use Stitch.DataCase
  alias Stitch.Analytics
  alias Stitch.Analytics.DailyReports

  describe "create/1" do
    test "with user" do
      user = insert(:user)
      {:ok, _} = DailyReports.create(user)
      events = Analytics.list_events()
      assert length(events) == 1
      identify_request = Enum.find(events, &(&1.payload["type"] == "identify"))
      traits = identify_request.payload["traits"]
      assert Map.get(traits, "messages_sent_last_day") == 0
      assert Map.get(traits, "messages_sent_last_7_days") == 0
      assert Map.get(traits, "messages_sent_last_30_days") == 0
      assert Map.get(traits, "messages_sent_all_time") == 0
      assert Map.has_key?(traits, "messages_sent_last_occurred_at")
    end

    test "with team" do
      team = insert(:team)
      insert(:user, team: team, roles: ["admin"])
      {:ok, _} = DailyReports.create(team)
      events = Analytics.list_events()
      assert length(events) == 1
      group_request = Enum.find(events, &(&1.payload["type"] == "group"))
      traits = group_request.payload["traits"]
      assert Map.get(traits, "messages_sent_last_day") == 0
      assert Map.get(traits, "messages_sent_last_7_days") == 0
      assert Map.get(traits, "messages_sent_last_30_days") == 0
      assert Map.get(traits, "messages_sent_all_time") == 0
      assert Map.has_key?(traits, "messages_sent_last_occurred_at")
    end
  end

  test "create/0" do
    team = insert(:team)
    insert(:user, team: team, roles: ["admin"])

    DailyReports.create()

    events = Analytics.list_events()

    identify_request = Enum.find(events, &(&1.payload["type"] == "identify"))
    traits = identify_request.payload["traits"]
    assert Map.get(traits, "messages_sent_last_day") == 0
    assert Map.get(traits, "messages_sent_last_7_days") == 0
    assert Map.get(traits, "messages_sent_last_30_days") == 0
    assert Map.get(traits, "messages_sent_all_time") == 0
    assert Map.has_key?(traits, "messages_sent_last_occurred_at")

    group_request = Enum.find(events, &(&1.payload["type"] == "group"))
    traits = group_request.payload["traits"]
    assert Map.get(traits, "messages_sent_last_day") == 0
    assert Map.get(traits, "messages_sent_last_7_days") == 0
    assert Map.get(traits, "messages_sent_last_30_days") == 0
    assert Map.get(traits, "messages_sent_all_time") == 0
    assert Map.has_key?(traits, "messages_sent_last_occurred_at")
  end
end
