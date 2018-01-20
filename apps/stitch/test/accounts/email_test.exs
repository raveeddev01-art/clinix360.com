defmodule Stitch.Accounts.EmailTest do
  use ExUnit.Case, async: true
  use Bamboo.Test
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Accounts.Email.confirmation_code_email/1" do
    test "sends an email with the confirmation code to the user" do
      user = insert(:user, %{email: "example@email.com", confirmation_code: "123123"})
      email = Stitch.Accounts.Email.confirmation_code_email(user)
      assert_delivered_email(email)
    end
  end

  describe "Stitch.Accounts.Email.temporary_password_reset/2" do
    test "sends an email to the user asking them to reset their password" do
      user = insert(:user, %{email: "example@email.com", confirmation_code: "123123"})
      email = Stitch.Accounts.Email.temporary_password_reset(user, "https://crystal.teamstitch.com/reset-password")
      assert_delivered_email(email)
    end
  end
end
