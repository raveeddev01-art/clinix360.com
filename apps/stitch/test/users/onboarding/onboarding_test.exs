defmodule Stitch.User.OnboardingTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.User.Onboarding.create_user_with_email/1" do
    test "creates a user given a unique email address" do
      user = Stitch.User.Onboarding.create_user_with_email("sergio@email.com")
      assert user.id != 0
      assert user.email == "sergio@email.com"
      assert user.onboarded == false
      assert String.length(user.confirmation_code) == 6
      assert String.length(user.token) == 32
    end

    test "returns error given empty string or nil" do
      {:error, message} = Stitch.User.Onboarding.create_user_with_email("")
      assert message != nil

      {:error, message} = Stitch.User.Onboarding.create_user_with_email(nil)
      assert message != nil
    end
  end

  describe "Stitch.User.Onboarding.send_confirmation_code/1" do
    test "returns an email struct and sends an email" do
      user = insert(:user, %{email: "example@email.com", confirmation_code: "123456"})
      result = Stitch.User.Onboarding.send_confirmation_code(user.id)
      assert result != nil
    end

    test "returns error for non-existing user" do
      {:error, message} = Stitch.User.Onboarding.send_confirmation_code(123)
      assert message == "User doesn't exist."
    end
  end

  describe "Stitch.User.Onboarding.verify_confirmation_code/2" do
    test "return true when confirmation code matches the user's confirmation code" do
      user = insert(:user, %{confirmation_code: "123456"})
      result = Stitch.User.Onboarding.verify_confirmation_code(user.id, "123456")
      assert result == true
    end

    test "saves email_confirmed to true if confirmation_code matches" do
      user = insert(:user, %{confirmation_code: "123456"})
      result = Stitch.User.Onboarding.verify_confirmation_code(user.id, "123456")
      assert result == true
      user = Stitch.Repo.get(Stitch.User, user.id)
      assert user.email_confirmed == true
    end

    test "return false when confirmation code does not match the user's confirmation code" do
      user = insert(:user, %{confirmation_code: "123456"})
      result = Stitch.User.Onboarding.verify_confirmation_code(user.id, "888888")
      assert result == false
    end
  end

  describe "Stitch.User.Onboarding.update_user/2" do
    test "it returns error if user doesn't exist" do
      {:error, message} = Stitch.User.Onboarding.update_user(1, %{})
      assert message == "User doesn't exist."
    end

    test "it returns error if user is already onboarded" do
      user = insert(:user, %{onboarded: true})
      {:error, message} = Stitch.User.Onboarding.update_user(user.id, %{})
      assert message == "Cannot update a user who has already been onboarded."
    end

    test "it updates the user information" do
      user = insert(:user, %{email: "example@email.com"})
      team = insert(:team, %{name: "A Team"})
      user_params = %{fullname: "John Doe", username: "johndoe", password: "passworD123!", pin: "1234", team_id: team.id}
      user = Stitch.User.Onboarding.update_user(user.id, user_params)
      assert user.team_id == team.id
      assert user.username == "johndoe"
      assert user.pin == "1234"
      assert String.length(user.encrypted_password) == 60
    end
  end
end
