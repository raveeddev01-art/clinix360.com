defmodule Stitch.AccountsTest do
  use ExUnit.Case, async: true

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Accounts.User.create_user_with_email_only/1" do
    test "it creates user with email address" do
      {:ok, user} = Stitch.Accounts.create_user_with_email_only("sergiotapia@outlook.com")
      assert user.email == "sergiotapia@outlook.com"
    end

    test "returns error when given nil" do
      {:error, message} = Stitch.Accounts.create_user_with_email_only(nil)
      assert message == "Email cannot be blank or nil."
    end

    test "returns error when given empty string" do
      {:error, message} = Stitch.Accounts.create_user_with_email_only("")
      assert message == "Email cannot be blank or nil."
    end
  end
end
