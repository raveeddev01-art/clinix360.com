defmodule Stitch.User.AuthenticationTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.User.Authentication.validate_email_and_password/3" do
    test "validates incorrect email and password match" do
      user_struct = %{
        email: "example@email.com",
        password: "password123",
        first_name: "John",
        last_name: "Doe"
      }
      team = insert(:team, %{name: "Care Clinic", slug: "care-clinic"})
      user = Stitch.User.Authentication.create_account(user_struct)

      user = Ecto.Changeset.change user, team_id: team.id
      Stitch.Repo.update user

      result = Stitch.User.Authentication.validate_email_and_password("example@email.com", "wrong", "care-clinic")
      assert result == false
    end

    test "validates password using dummypw check when non-existing email is provided" do
      result = Stitch.User.Authentication.validate_email_and_password("example@email.com", "wrong", "some-team")
      assert result == false
    end
  end

  test "hashes a plaintext password using bcrypt" do
    hashed_password = Stitch.User.Authentication.hash_password("example")
    assert String.length(hashed_password) == 60
  end

  test "creates a user account" do
    user_struct = %{
      email: "example@email.com",
      password: "password123",
      first_name: "John",
      last_name: "Doe"
    }
    user = Stitch.User.Authentication.create_account(user_struct)
    assert user.first_name == "John"
    assert user.last_name == "Doe"
    assert user.email == "example@email.com"
    assert String.length(user.password_hash) == 60
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
      first_name: "John",
      last_name: "Doe"
    }
    team = insert(:team, %{name: "Care Clinic", slug: "care-clinic"})
    user = Stitch.User.Authentication.create_account(user_struct)

    user = Ecto.Changeset.change user, team_id: team.id
    Stitch.Repo.update user

    user = Stitch.User.Authentication.validate_email_and_password("example@email.com", "password123", "care-clinic")
    assert user.email == "example@email.com"
  end

  describe "Stitch.User.Authentication.update_password/2" do
    test "it updates the password for a user" do
      user = insert(:user, %{email: "example@email.com", password_hash: "password"})
      team = insert(:team, %{name: "Care Clinic", slug: "care-clinic"})
      user = Ecto.Changeset.change user, team_id: team.id
      {:ok, user} = Stitch.Repo.update user

      result = Stitch.User.Authentication.update_password(user.id, "123456")
      assert result == true

      # Incorrect password should return false.
      password_result = Stitch.User.Authentication.validate_email_and_password("example@email.com", "password123", "care-clinic")
      assert password_result == false

      # Correct password should return user.
      user = Stitch.User.Authentication.validate_email_and_password("example@email.com", "123456", "care-clinic")
      assert user.email == "example@email.com"
    end
  end

  describe "Stitch.User.Authentication.user_for_token/1" do
    test "returns user given a token" do
      insert(:user, %{token: "abcdef"})
      user = Stitch.User.Authentication.user_for_token("abcdef")
      assert user != nil
    end

    test "returns nil given a bad token" do
      user = Stitch.User.Authentication.user_for_token("abcdef")
      assert user == nil
    end
  end

  test "it return user if the password reset token is valid" do
    user = insert(:user, %{password_reset_token: "SomeRandomToken"})
    returned_user = Stitch.User.Authentication.check_for_valid_reset_token("SomeRandomToken")
    assert user.email == returned_user.email
  end

  test "it returns false if the password reset token is invalid" do
    insert(:user, %{password_reset_token: "SomeRandomToken"})
    assert Stitch.User.Authentication.check_for_valid_reset_token("InvalidToken") == false
  end

  test "it creates a password reset token for user " do
    team = insert(:team, %{name: "Test Team", slug: "test-team"})
    user = insert(:user, %{email: "sadan@example.com", team_id: team.id, password_hash: Comeonin.Bcrypt.hashpwsalt("sadan123")})

    {:ok, returned_user} = Stitch.User.Authentication.create_reset_password_token_for_user(user.email, team.slug)

    assert returned_user.password_reset_token != nil

  end



end
