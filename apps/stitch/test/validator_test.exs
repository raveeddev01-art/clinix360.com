defmodule Stitch.ValidatorTest do
  use ExUnit.Case, async: true
  alias Stitch.Accounts.User

  describe "Stitch.Validators.validate_no_emojis/2" do
    test "should pass for empty field" do
      changeset = %User{}
        |> Ecto.Changeset.change()
        |> Stitch.Validators.validate_no_emojis(:first_name)

      assert changeset.valid? == true
    end

    test "should pass for field not having emojis" do
      changeset = %User{}
        |> Ecto.Changeset.change(first_name: "It do not have emojis")
        |> Stitch.Validators.validate_no_emojis(:first_name)

      assert changeset.valid? == true
    end

    test "should fail for field having emojis" do
      changeset = %User{}
        |> Ecto.Changeset.change(first_name: "It do 😎 have emojis")
        |> Stitch.Validators.validate_no_emojis(:first_name)

      assert changeset.valid? == false
      assert changeset.errors == [first_name: {"should not have emojis.", []}]
    end
  end
end