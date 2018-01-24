defmodule Stitch.Accounts.UserTest do
  use ExUnit.Case, async: true
  alias Stitch.Accounts.User

  describe "Stitch.Accounts.User.changeset/2 first_name and last_name should not have emojis" do
    test "should pass for fields not having emojis" do
      changeset = %User{}
        |> User.changeset(%{first_name: "First", last_name: "Last"})

      assert changeset.valid? == true
    end

    test "should pass for first_name having emojis" do
      changeset = %User{}
        |> User.changeset(%{first_name: "First 💫", last_name: "Last"})

      assert changeset.valid? == false
      assert changeset.errors == [first_name: {"should not have emojis.", []}]
    end

    test "should pass for last_name having emojis" do
      changeset = %User{}
        |> User.changeset(%{first_name: "First", last_name: "Last 🙌"})

      assert changeset.valid? == false
      assert changeset.errors == [last_name: {"should not have emojis.", []}]
    end
  end
end