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
    end

    test "returns error given empty string or nil" do
      {:error, message} = Stitch.User.Onboarding.create_user_with_email("")
      assert message != nil

      {:error, message} = Stitch.User.Onboarding.create_user_with_email(nil)
      assert message != nil
    end
  end

  # describe "Stitch.User.Onboarding.submit_confirmation_code/2" do
  #   test "it returns true when confirmation code matches" do
  #     user = insert(:user, %{confirmation_code: "123456"})
  #     result = Stitch.User.Onboarding.submit_confirmation_code(user.id, "123456")
  #     assert result == true
  #   end

  #   test "it returns false when confirmation code doesn't match" do
  #     user = insert(:user, %{confirmation_code: "123456"})
  #     result = Stitch.User.Onboarding.submit_confirmation_code(user.id, "000000")
  #     assert result == false
  #   end
  # end
end