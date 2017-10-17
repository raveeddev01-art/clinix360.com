defmodule Stitch.Exports.TeamHistoryTest do
  use ExUnit.Case
  alias Stitch.Exports.TeamHistory

  describe "generate_file_name/1" do
    test "returns a file name for a given team" do
      name = "Group 1"
      team = %Stitch.Team{name: name}
      filename = TeamHistory.generate_filename(team)
      assert Regex.match?(~r/^#{name} Stitch Export \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.?\d*Z$/, filename)
    end
  end

  describe "list_target_months/1" do
    test "lists all target months with valid start and end datetimes" do
      {:ok, start_at} = NaiveDateTime.new(2016, 11, 1, 0, 0, 0) # year, month, day, hour, minute, second
      {:ok, end_at}  = NaiveDateTime.new(2017, 2, 1, 0, 0, 0)
      target_months = TeamHistory.list_target_months(start_at, end_at)
      assert target_months == [{2017, 2}, {2017, 1}, {2016, 12}, {2016, 11}]
    end
  end
end
