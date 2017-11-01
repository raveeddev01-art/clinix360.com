defmodule Stitch.AccountsTest do
  use Stitch.DataCase, async: true
  alias Stitch.Accounts

  describe "Accounts.create_user_with_email_only/1" do
    test "it creates user with email address" do
      user = Accounts.create_user_with_email_only("sergiotapia@outlook.com")
      assert user.email == "sergiotapia@outlook.com"
    end

    test "returns error when given nil" do
      {:error, message} = Accounts.create_user_with_email_only(nil)
      assert message == "Email cannot be blank or nil."
    end

    test "returns error when given empty string" do
      {:error, message} = Accounts.create_user_with_email_only("")
      assert message == "Email cannot be blank or nil."
    end
  end

  describe "Accounts.update_and_complete_user_onboarding/2" do
    test "it onboards the user and sets the admin role for his new team" do
      team = insert(:team)
      user = insert(:user, %{email: "sergio@email.com", onboarded: false})
      attrs = %{
        fullname: "Sergio Tapia",
        username: "sergiotapia",
        password: "Password123!",
        pin: "0000",
        roles: ["admin"],
        team_id: team.id
      }

      user = Accounts.update_and_complete_user_onboarding(user.id, attrs)
      assert user.team_id == team.id
      assert user.roles == ["admin"]
    end
  end

  describe "Accounts.create_and_complete_user_onboarding/1" do
    test "it onboards the user and sets the admin role for his new team" do
      team = insert(:team)
      attrs = %{
        email: "sergio@gmail.com",
        fullname: "Sergio Tapia",
        username: "sergiotapia3",
        password: "Password123!",
        pin: "0000",
        roles: ["admin"],
        team_id: team.id
      }
      user = Accounts.create_and_complete_user_onboarding(attrs)
      assert user.team_id == team.id
      assert user.roles == ["admin"]
    end
  end

  describe "Accounts.update_user_password/3" do
    test "it only updates the user password if the old password provided is valid" do
      user = insert(:user, %{email: "sadan@example.com", password_hash: Comeonin.Bcrypt.hashpwsalt("sadan123")})
      {:error, message} = Accounts.update_user_password(user.id, "sadan1234", "stitch123")
      assert message == "Invalid Password for user"
    end
  end
end
