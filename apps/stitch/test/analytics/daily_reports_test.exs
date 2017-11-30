defmodule Stitch.Analytics.DailyReportsTest do
  use Stitch.DataCase
  alias Stitch.Analytics
  alias Stitch.Analytics.DailyReports

  describe "create/1" do
    test "with on-boarded user" do
      user = insert(:user, onboarded: true)
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

    test "with user not on-boarded" do
      user = insert(:user, onboarded: false)
      assert {:error, :user_not_onboarded} = DailyReports.create(user)
      assert Analytics.list_events() == []
    end

    test "with team with admin/owner" do
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

    test "with team with no admin/owner" do
      # we don't want to create daily reports for teams with no admin/owner
      team = insert(:team)
      insert(:user, team: team)
      {:error, :nil_owner} = DailyReports.create(team)
      assert Analytics.list_events() == []
    end
  end

  describe "create/0" do
    test "with team with admin/owner" do
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

    test "with team with no admin/owner" do
      # we don't want to create daily reports for teams with no admin/owner
      team = insert(:team)
      insert(:user, team: team)
      DailyReports.create()
      [event] = Analytics.list_events()
      refute event.payload["type"] == "group"
    end

    test "with user not on-boarded" do
      insert(:user, onboarded: false)
      DailyReports.create()
      assert Analytics.list_events() == []
    end
  end
end
