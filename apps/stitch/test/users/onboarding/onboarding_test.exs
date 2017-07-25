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

  describe "Stitch.User.Onboarding.invite_user_to_team/2" do
    test "it creates a new user associated with team" do
      team = insert(:team)
      user = insert(:user, team_id: team.id)
      result_user = Stitch.User.Onboarding.invite_user_to_team(user.id, "new@email.com")
      assert result_user.team_id == team.id
      assert result_user.email == "new@email.com"
      assert String.length(result_user.invite_token) == 32
    end

    test "it returns an error for user with no team" do
      user = insert(:user, team_id: nil)
      {:error, message} = Stitch.User.Onboarding.invite_user_to_team(user.id, "new@email.com")
      assert message == "Cannot send the invite because the user has no team."
    end

    test "it returns an error if user with that email exists on the team already" do
      team = insert(:team)
      user = insert(:user, %{email: "a@email.com", team_id: team.id})
      {:error, message} = Stitch.User.Onboarding.invite_user_to_team(user.id, "a@email.com")
      assert message == "User with this email already exists on this team."
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
end
