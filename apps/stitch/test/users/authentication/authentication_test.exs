defmodule Stitch.User.AuthenticationTest do
  use Stitch.DataCase, async: true
  alias Stitch.{Accounts.User, User.Authentication}

  describe "Authentication.validate_email_and_password/3" do
    test "when email and password match" do
      team = insert(:team, slug: "care-clinic")
      insert(:user, team: team, email: "example@email.com")

      assert %User{email: "example@email.com"} =
        Authentication.validate_email_and_password("example@email.com", "password", team)
    end

    test "email case insensitivity" do
      team = insert(:team, slug: "care-clinic")
      insert(:user, team: team, email: "Example@email.com")

      assert %User{email: "Example@email.com"} =
        Authentication.validate_email_and_password("example@email.com", "password", team)
    end

    test "when password is wrong" do
      team = insert(:team, slug: "care-clinic")
      insert(:user, team: team, email: "example@email.com")

      refute Authentication.validate_email_and_password("example@email.com", "wrong", team)
    end

    test "validates password using dummypw check when non-existing email is provided" do
      team = insert(:team)
      result = Authentication.validate_email_and_password("example@email.com", "wrong", team)
      assert result == false
    end
  end

  test "hashes a plaintext password using bcrypt" do
    hashed_password = Authentication.hash_password("example")
    assert String.length(hashed_password) == 60
  end

  describe "Authentication.check_for_valid_reset_token/1" do
    test "it return user if the password reset token is valid" do
      user = insert(:user, %{password_reset_token: "SomeRandomToken"})
      returned_user = Authentication.check_for_valid_reset_token("SomeRandomToken")
      assert user.email == returned_user.email
    end

    test "it returns false if the password reset token is invalid" do
      insert(:user, %{password_reset_token: "SomeRandomToken"})
      assert Authentication.check_for_valid_reset_token("InvalidToken") == false
    end
  end

  describe "Authentication.create_reset_password_token/2" do
    test "it creates a password reset token for user " do
      team = insert(:team, %{name: "Test Team", slug: "test-team"})
      user = insert(:user, %{email: "sadan@example.com", team_id: team.id, password_hash: Comeonin.Bcrypt.hashpwsalt("sadan123")})
      {:ok, returned_user} = Authentication.create_reset_password_token(team, user.email)
      assert returned_user.password_reset_token != nil
    end
  end

  describe "Authentication.reset_password/2" do
    test "resets password" do
      user = insert(:user, password_reset_token: "token")
      assert {:ok, updated_user} = Authentication.reset_password("token", "new_password")
      assert updated_user.password_hash != user.password_hash
    end

    test "returns error if the new password is the same as old one" do
      insert(:user, password_reset_token: "token", password_hash: Authentication.hash_password("password"))
      assert {:error, changeset} = Authentication.reset_password("token", "password")
      assert changeset.errors[:password] == {"The new password must be different from the old one", []}
    end
  end
end
