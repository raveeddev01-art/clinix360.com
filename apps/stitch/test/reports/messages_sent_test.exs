defmodule Stitch.Reports.MessagesSentTest do
  use Stitch.DataCase
  alias Stitch.Reports.MessagesSent

  test "with ':last_30_days' option" do
    {:ok, datetime_1} = NaiveDateTime.new(2017, 1, 1, 0, 0, 0) # year, month, day, hour, minute, second
    {:ok, datetime_2} = NaiveDateTime.new(2017, 1, 5, 0, 0, 0)
    {:ok, datetime_3} = NaiveDateTime.new(2016, 9, 1, 0, 0, 0)
    {:ok, datetime_4} = NaiveDateTime.new(2017, 2, 1, 0, 0, 0)
    {:ok, end_at} = Date.new(2017, 1, 30)
    team = insert(:team)
    team_2 = insert(:team)
    group_1 = insert(:group, team: team)
    group_2 = insert(:group, team: team)
    group_3 = insert(:group, team: team)
    group_4 = insert(:group, team: team_2)
    user_1 = insert(:user, team: team)
    user_2 = insert(:user, team: team)
    user_3 = insert(:user, team: team)
    user_4 = insert(:user, team: team_2)
    insert(:message, user: user_1, group: group_1, inserted_at: datetime_1)
    insert(:message, user: user_2, group: group_1, inserted_at: datetime_1)
    insert(:message, user: user_3, group: group_2, inserted_at: datetime_1)
    insert(:message, user: user_1, group: group_2, inserted_at: datetime_1)
    insert(:message, user: user_2, group: group_3, inserted_at: datetime_2)
    insert(:message, user: user_3, group: group_3, inserted_at: datetime_2)
    insert(:message, user: user_3, group: group_3, inserted_at: datetime_3) # not in range
    insert(:message, user: user_3, group: group_3, inserted_at: datetime_4) # not in range
    insert(:message, user: user_4, group: group_4, inserted_at: datetime_1) # not in team

    opts = [time_period: :last_30_days, end_at: end_at]
    results = MessagesSent.build(team, opts)

    assert results["2017-01-01"] == 4
    assert results["2017-01-05"] == 2

    expected_keys =
      end_at
      |> Date.add(-29)
      |> Date.range(end_at)
      |> Enum.map(&Date.to_iso8601/1)

    keys_with_zero_messages =
      expected_keys -- ["2017-01-01", "2017-01-05"]

    for key <- keys_with_zero_messages do
      assert Map.get(results, key) == 0
    end
  end

  test "with ':last_7_days' option" do
    {:ok, datetime_1} = NaiveDateTime.new(2017, 1, 15, 0, 0, 0)
    {:ok, datetime_2} = NaiveDateTime.new(2017, 1, 25, 0, 0, 0)
    {:ok, datetime_3} = NaiveDateTime.new(2016, 9, 1, 0, 0, 0)
    {:ok, datetime_4} = NaiveDateTime.new(2017, 2, 1, 0, 0, 0)
    {:ok, end_at} = Date.new(2017, 1, 30)
    team = insert(:team)
    team_2 = insert(:team)
    group_1 = insert(:group, team: team)
    group_2 = insert(:group, team: team)
    group_3 = insert(:group, team: team)
    group_4 = insert(:group, team: team_2)
    user_1 = insert(:user, team: team)
    user_2 = insert(:user, team: team)
    user_3 = insert(:user, team: team)
    user_4 = insert(:user, team: team_2)
    insert(:message, user: user_1, group: group_1, inserted_at: datetime_1) # not in range
    insert(:message, user: user_2, group: group_1, inserted_at: datetime_1) # not in range
    insert(:message, user: user_3, group: group_2, inserted_at: datetime_1) # not in range
    insert(:message, user: user_1, group: group_2, inserted_at: datetime_1) # not in range
    insert(:message, user: user_2, group: group_3, inserted_at: datetime_2)
    insert(:message, user: user_3, group: group_3, inserted_at: datetime_2)
    insert(:message, user: user_3, group: group_3, inserted_at: datetime_3) # not in range
    insert(:message, user: user_3, group: group_3, inserted_at: datetime_4) # not in range
    insert(:message, user: user_4, group: group_4, inserted_at: datetime_1) # not in team

    opts = [time_period: :last_7_days, end_at: end_at]
    results = MessagesSent.build(team, opts)

    assert results["2017-01-25"] == 2

    expected_keys =
      end_at
      |> Date.add(-6)
      |> Date.range(end_at)
      |> Enum.map(&Date.to_iso8601/1)

    keys_with_zero_messages =
      expected_keys -- ["2017-01-25"]

    for key <- keys_with_zero_messages do
      assert Map.get(results, key) == 0
    end
  end

  test "with ':all_time' option" do
    {:ok, team_inserted_at} = NaiveDateTime.new(2016, 12, 25, 0, 0, 0)
    {:ok, datetime_1} = NaiveDateTime.new(2016, 12, 29, 0, 0, 0)
    {:ok, datetime_2} = NaiveDateTime.new(2017, 1, 1, 0, 0, 0)
    {:ok, datetime_3} = NaiveDateTime.new(2017, 1, 25, 0, 0, 0)
    {:ok, end_at} = Date.new(2017, 1, 30)
    team = insert(:team, inserted_at: team_inserted_at)
    team_2 = insert(:team)
    group_1 = insert(:group, team: team)
    group_2 = insert(:group, team: team)
    group_3 = insert(:group, team: team)
    group_4 = insert(:group, team: team_2)
    user_1 = insert(:user, team: team)
    user_2 = insert(:user, team: team)
    user_3 = insert(:user, team: team)
    user_4 = insert(:user, team: team_2)
    insert(:message, user: user_1, group: group_1, inserted_at: datetime_1)
    insert(:message, user: user_2, group: group_1, inserted_at: datetime_1)
    insert(:message, user: user_3, group: group_2, inserted_at: datetime_1)
    insert(:message, user: user_1, group: group_2, inserted_at: datetime_1)
    insert(:message, user: user_2, group: group_3, inserted_at: datetime_2)
    insert(:message, user: user_3, group: group_3, inserted_at: datetime_2)
    insert(:message, user: user_3, group: group_3, inserted_at: datetime_3)
    insert(:message, user: user_4, group: group_4, inserted_at: datetime_1) # not in team

    opts = [time_period: :all_time, end_at: end_at]
    results = MessagesSent.build(team, opts)

    assert results["2016-12-29"] == 4
    assert results["2017-01-01"] == 2
    assert results["2017-01-25"] == 1

    expected_keys =
      team_inserted_at
      |> Date.range(end_at)
      |> Enum.map(&Date.to_iso8601/1)

    keys_with_zero_messages =
      expected_keys -- ["2016-12-29", "2017-01-01", "2017-01-25"]

    for key <- keys_with_zero_messages do
      assert Map.get(results, key) == 0
    end
  end

  test "with 'upload' type option" do
    {:ok, datetime_1} = NaiveDateTime.new(2017, 1, 15, 0, 0, 0)
    {:ok, datetime_2} = NaiveDateTime.new(2017, 1, 25, 0, 0, 0)
    {:ok, datetime_3} = NaiveDateTime.new(2016, 9, 1, 0, 0, 0)
    {:ok, datetime_4} = NaiveDateTime.new(2017, 2, 1, 0, 0, 0)
    {:ok, end_at} = Date.new(2017, 1, 30)
    team = insert(:team)
    team_2 = insert(:team)
    group_1 = insert(:group, team: team)
    group_2 = insert(:group, team: team)
    group_3 = insert(:group, team: team)
    group_4 = insert(:group, team: team_2)
    user_1 = insert(:user, team: team)
    user_2 = insert(:user, team: team)
    user_3 = insert(:user, team: team)
    user_4 = insert(:user, team: team_2)

    # not in range and not an upload
    insert(:message, user: user_1, group: group_1, inserted_at: datetime_1)

    # not in range and not an upload
    insert(:message, user: user_2, group: group_1, inserted_at: datetime_1)

    # not in range and not an upload
    insert(:message, user: user_3, group: group_2, inserted_at: datetime_1)

    # these two should be in the report
    insert(:message, type: "upload", user: user_1, group: group_2, inserted_at: datetime_2)
    insert(:message, type: "upload", user: user_2, group: group_3, inserted_at: datetime_2)

    # not an upload
    insert(:message, user: user_3, group: group_3, inserted_at: datetime_2)

    # not in range and not an upload
    insert(:message, user: user_3, group: group_3, inserted_at: datetime_3)

    # not in range
    insert(:message, type: "upload", user: user_3, group: group_3, inserted_at: datetime_4)

    # not in team
    insert(:message, type: "upload", user: user_4, group: group_4, inserted_at: datetime_1)

    opts = [type: :upload, time_period: :last_7_days, end_at: end_at]
    results = MessagesSent.build(team, opts)

    assert results["2017-01-25"] == 2

    expected_keys =
      end_at
      |> Date.add(-6)
      |> Date.range(end_at)
      |> Enum.map(&Date.to_iso8601/1)

    keys_with_zero_messages =
      expected_keys -- ["2017-01-25"]

    for key <- keys_with_zero_messages do
      assert Map.get(results, key) == 0
    end
  end
end
