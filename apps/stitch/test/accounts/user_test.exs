defmodule Stitch.Accounts.UserTest do
  use ExUnit.Case, async: true
  alias Stitch.Accounts.User

  describe "Stitch.Accounts.User.changeset/2 username should contain only lowercased alphanumeric characters" do
    test "should pass for username with lowercased alphanumeric characters" do
      changeset = User.changeset(%User{first_name: "First", last_name: "Last"}, %{username: "bob"})
      assert changeset.valid? == true
    end

    test "should not pass for username with non alphanumeric characters" do
      changeset = User.changeset(%User{first_name: "First", last_name: "Last"}, %{username: "bob."})
      assert changeset.valid? == false
      assert changeset.errors == [username: {"has invalid format", [validation: :format]}]
    end
  end

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

  describe "Stitch.Accounts.User.changeset/2 should trim whitespaces in email" do
    test "trims whitespaces" do
      changeset = User.changeset(%User{}, %{email: " foo@example.com   "})
      assert changeset.changes.email == "foo@example.com"
    end
  end
end
