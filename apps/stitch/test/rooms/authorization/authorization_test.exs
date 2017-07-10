defmodule Stitch.Room.AuthorizationTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Room.Authorization.can_join?/2" do
    test "returns the room for matching team_id between room and user" do
      team = insert(:team)
      room = insert(:room, %{team_id: team.id})
      user = insert(:user, %{team_id: team.id})

      room = Stitch.Room.Authorization.can_join?(room.id, user.id)
      assert room != nil
      assert room.team_id == team.id
    end

    test "returns false for non-matching team_id" do
      team = insert(:team, %{slug: "abc"})
      team_2 = insert(:team, %{slug: "def"})
      room = insert(:room, %{team_id: team.id})
      user = insert(:user, %{team_id: team_2.id})

      result = Stitch.Room.Authorization.can_join?(room.id, user.id)
      assert result == false
    end
  end
end
