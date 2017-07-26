defmodule Stitch.User.OnboardingTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
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
