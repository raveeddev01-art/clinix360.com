defmodule Stitch.GroupTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Group.toggle_favorite/2" do
    test "it favorites new groups for user" do
      group = insert(:group)
      user = insert(:user, %{favorite_groups: []})
      result = Stitch.Group.toggle_favorite(group.id, user.id)
      assert result == true
    end

    test "it unfavorites existing group for user" do
      group = insert(:group)
      user = insert(:user, %{favorite_groups: [group.id]})
      result = Stitch.Group.toggle_favorite(group.id, user.id)
      assert result == false
    end
  end
end