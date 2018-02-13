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
end
