defmodule Stitch.UserAuthorizationTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.UserAuthorization.can_update_user?/2" do
    test "return true if user is changing its own avatar" do
      user = insert(:user, %{})

      result = Stitch.UserAuthorization.can_update_user?(user, user.id)
      assert result == true
    end

    test "return false if user is trying to change someone else's avatar" do
      user1 = insert(:user, %{})
      user2 = insert(:user, %{})

      result = Stitch.UserAuthorization.can_update_user?(user1, user2.id)
      assert result == false
    end

    test "return true if user is admin and trying to change someone else's avatar" do
      user1 = insert(:user, %{roles: ["admin"]})
      user2 = insert(:user, %{})

      result = Stitch.UserAuthorization.can_update_user?(user1, user2.id)
      assert result == true
    end
  end
end
