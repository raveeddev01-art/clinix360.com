defmodule Stitch.UserQueriesTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  test "get_by_id when id is less than one" do
    {:error, message} = Stitch.UserQueries.get_by_id(0)
    assert message == "Id cannot be less than 1."
  end

  test "get_by_id when id is not an integer" do
    {:error, message} = Stitch.UserQueries.get_by_id("a")
    assert message == "Id isn't an integer."
  end

  test "get_by_id when id doesn't exist in the database" do
    {:not_found, message} = Stitch.UserQueries.get_by_id(1)
    assert message == "User with id 1 was not found."
  end

  test "get_by_id returns user record for id" do
    user = insert(:user)
    record = Stitch.UserQueries.get_by_id(user.id)
    assert record.id == user.id
  end
end