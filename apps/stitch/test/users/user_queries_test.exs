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

  describe "Stitch.UserQueries.get_by_token/1" do
    test "returns malformed token error for incorrect token" do
      {:error, message} = Stitch.UserQueries.get_by_token("abc")
      assert message == "Token is malformed."
    end

    test "returns not found message for unknown token" do
      token = :crypto.strong_rand_bytes(32) |> Base.url_encode64 |> binary_part(0, 32)
      {:not_found, message} = Stitch.UserQueries.get_by_token(token)
      assert message == "User with token #{token} was not found."
    end

    test "returns user given an existing token" do
      token = :crypto.strong_rand_bytes(32) |> Base.url_encode64 |> binary_part(0, 32)
      insert(:user, %{token: token})
      user = Stitch.UserQueries.get_by_token(token)
      assert user.token == token
      assert user.id != nil
    end
  end
end