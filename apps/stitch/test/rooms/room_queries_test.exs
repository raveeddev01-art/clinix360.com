defmodule Stitch.RoomQueriesTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "rooms_for_team/1" do
    test "returns rooms for a given team" do
      team = insert(:team, %{name: "Care Clinic"})
      insert(:room, %{name: "A", team_id: team.id})
      insert(:room, %{name: "B", team_id: team.id})
      rooms = Stitch.RoomQueries.rooms_for_team(team.id)
      assert Enum.count(rooms) == 2
    end

    test "returns error for non-integer team_id" do
      {:error, message} = Stitch.RoomQueries.rooms_for_team("asd")
      assert message == "team_id must be an integer"
    end
  end
end