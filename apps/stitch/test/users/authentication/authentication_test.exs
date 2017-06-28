defmodule Stitch.User.AuthenticationTest do
  use ExUnit.Case, async: true

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  test "hashes a plaintext password using bcrypt" do
    hashed_password = Stitch.User.Authentication.hash_password("example")
    assert String.length(hashed_password) == 60
  end

  test "creates a user account" do
    user_struct = %{
      email: "example@email.com",
      password: "password123",
      fullname: "John Doe"
    }
    user = Stitch.User.Authentication.create_account(user_struct)
    assert user.fullname == "John Doe"
    assert user.email == "example@email.com"
    assert String.length(user.encrypted_password) == 60
  end

  test "rejects an invalid user  user account" do
    user_struct = %{}
    changeset = Stitch.User.Authentication.create_account(user_struct)
    assert changeset.valid? == false
  end

  test "validates email and password match" do
    user_struct = %{
      email: "example@email.com",
      password: "password123",
      fullname: "John Doe"
    }
    Stitch.User.Authentication.create_account(user_struct)

    result = Stitch.User.Authentication.validate_email_and_password("example@email.com", "password123")
    assert result == true
  end

  test "validates incorrect email and password match" do
    user_struct = %{
      email: "example@email.com",
      password: "password123",
      fullname: "John Doe"
    }
    Stitch.User.Authentication.create_account(user_struct)

    result = Stitch.User.Authentication.validate_email_and_password("example@email.com", "wrong")
    assert result == false
  end

  test "validates password using dummypw check when non-existing email is provided" do
    result = Stitch.User.Authentication.validate_email_and_password("example@email.com", "wrong")
    assert result == false
  end
end