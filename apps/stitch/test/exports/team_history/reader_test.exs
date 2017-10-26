defmodule Stitch.Exports.TeamHistory.ReaderTest do
  use Stitch.DataCase
  alias Stitch.Exports.TeamHistory.Reader, as: TeamHistory

  describe "get_groups_data/1" do
    test "returns group data for a given team" do
      team_1 = insert(:team)
      team_2 = insert(:team)
      group_1 = insert(:group, team: team_1)
      group_2 = insert(:group, team: team_1)
      group_3 = insert(:group, team: team_2)
      user_1 = insert(:user, team: team_1)
      user_2 = insert(:user, team: team_1)
      user_3 = insert(:user, team: team_2)
      _group_user_1 = insert(:group_user, group: group_1, user: user_1)
      _group_user_2 = insert(:group_user, group: group_1, user: user_2)
      message_1 = insert(:message,
                         user: user_1,
                         group: group_1,
                         pinned: true,
                         pinned_by_id: user_2.id,
                         pinned_at: NaiveDateTime.utc_now() |> NaiveDateTime.to_iso8601())
      message_2 = insert(:message,
                         user: user_1,
                         group: group_1,
                         pinned: false)

      group_exports = TeamHistory.get_group_data(team_1)

      group_ids = Enum.map(group_exports, &(&1.id))
      assert length(group_exports) == 2
      assert group_1.id in group_ids
      assert group_2.id in group_ids
      refute group_3.id in group_ids
      assert group_1.name
      assert group_1.creator_user_id
      assert group_1.inserted_at
      assert group_1.description
      assert group_1.public

      group_1_export = Enum.find(group_exports, &(&1.id == group_1.id))
      assert user_1.id in group_1_export.members
      assert user_2.id in group_1_export.members
      refute user_3.id in group_1_export.members

      group_1_export_pins = Enum.map(group_1_export.pins, fn %{id: id} -> id end)
      assert message_1.id in group_1_export_pins
      refute message_2.id in group_1_export_pins
      assert length(group_1_export.pins)

      pinned_message = hd(group_1_export.pins)
      assert pinned_message.id == message_1.id
      assert pinned_message.user_id == user_1.id
      assert pinned_message.pinned_by_id == user_2.id
      assert pinned_message.pinned_at == message_1.pinned_at
    end
  end

  describe "get_user_data/1" do
    test "returns user data for a given team" do
      team_1 = insert(:team)
      team_2 = insert(:team)
      group_1 = insert(:group, team: team_1)
      user_1 = insert(:user, team: team_1)
      user_2 = insert(:user, team: team_1)
      user_3 = insert(:user, team: team_2)
      _group_user_1 = insert(:group_user, group: group_1, user: user_1)
      _group_user_2 = insert(:group_user, group: group_1, user: user_2)

      user_exports = TeamHistory.get_user_data(team_1)

      user_export_ids = Enum.map(user_exports, &(&1.id))
      assert user_1.id in user_export_ids
      assert user_2.id in user_export_ids
      refute user_3.id in user_export_ids

      user_1_export = Enum.find(user_exports, &(&1.id == user_1.id))
      disallowed_fields = ~w(
        password_hash confirmation_code onboarded email_confirmation pin token
        disabled password_reset_token desktop_notification_preference
        mobile_notification_preference email_notification_preference
      )a
      Enum.each(user_1_export, fn {k, _} ->
        refute k in disallowed_fields
      end)
      Enum.each(user_1_export, fn {k, v} ->
        assert Map.get(user_1, k) == v
      end)
    end
  end

  describe "get_message_data_for_month/2" do
    test "returns empty list if no messages found" do
      team = insert(:team)
      message_data = TeamHistory.get_message_data_for_month(team, {2017, 1})
      assert message_data == []
    end

    test "returns message data for a given team and month" do
      {:ok, target_datetime_1} = NaiveDateTime.new(2017, 1, 1, 0, 0, 0) # year, month, day, hour, minute, second
      {:ok, target_datetime_2} = NaiveDateTime.new(2017, 1, 2, 0, 0, 0)
      team_1 = insert(:team)
      team_2 = insert(:team)
      group_1 = insert(:group, team: team_1)
      group_2 = insert(:group, team: team_1)
      group_3 = insert(:group, team: team_2)
      user_1 = insert(:user, team: team_1)
      user_2 = insert(:user, team: team_1)
      user_3 = insert(:user, team: team_2)
      _group_user_1 = insert(:group_user, group: group_1, user: user_1)
      _group_user_2 = insert(:group_user, group: group_2, user: user_2)
      _group_user_3 = insert(:group_user, group: group_3, user: user_3)
      message_1 = insert(:message, user: user_1, group: group_1, inserted_at: target_datetime_1)
      message_2 = insert(:message, user: user_1, group: group_1, inserted_at: target_datetime_2)
      message_3 = insert(:message, user: user_1, group: group_2, inserted_at: target_datetime_1)
      message_4 = insert(:message, user: user_1, group: group_2)
      message_5 = insert(:message, user: user_1, group: group_3)

      message_data = TeamHistory.get_message_data_for_month(team_1, {2017, 1})

      assert Enum.any?(message_data, &(&1.group_id == group_1.id))
      assert Enum.any?(message_data, &(&1.group_id == group_2.id))
      refute Enum.any?(message_data, &(&1.group_id == group_3.id))

      export_group_1 = Enum.find(message_data, &(&1.group_id == group_1.id))
      export_group_2 = Enum.find(message_data, &(&1.group_id == group_2.id))
      export_group_1_datetime_1_messages = Map.get(export_group_1.messages, "2017-01-01")
      export_group_1_datetime_2_messages = Map.get(export_group_1.messages, "2017-01-02")
      export_group_2_datetime_1_messages = Map.get(export_group_2.messages, "2017-01-01")
      assert length(export_group_1_datetime_1_messages) == 1
      assert length(export_group_1_datetime_2_messages) == 1
      assert length(export_group_2_datetime_1_messages) == 1

      export_group_1_datetime_1_message_ids = Enum.map(export_group_1_datetime_1_messages, &(&1.id))
      export_group_1_datetime_2_message_ids = Enum.map(export_group_1_datetime_2_messages, &(&1.id))
      export_group_2_datetime_1_message_ids = Enum.map(export_group_2_datetime_1_messages, &(&1.id))

      assert message_1.id in export_group_1_datetime_1_message_ids
      refute message_1.id in export_group_1_datetime_2_message_ids
      refute message_1.id in export_group_2_datetime_1_message_ids

      assert message_2.id in export_group_1_datetime_2_message_ids
      refute message_2.id in export_group_1_datetime_1_message_ids
      refute message_2.id in export_group_2_datetime_1_message_ids

      assert message_3.id in export_group_2_datetime_1_message_ids
      refute message_3.id in export_group_1_datetime_1_message_ids
      refute message_3.id in export_group_1_datetime_1_message_ids

      refute message_4.id in export_group_1_datetime_1_message_ids
      refute message_4.id in export_group_1_datetime_2_message_ids
      refute message_4.id in export_group_2_datetime_1_message_ids

      refute message_5.id in export_group_1_datetime_1_message_ids
      refute message_5.id in export_group_1_datetime_2_message_ids
      refute message_5.id in export_group_2_datetime_1_message_ids
    end
  end
end
