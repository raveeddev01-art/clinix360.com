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

  describe "Stitch.Accounts.Email.role_changed_email/3" do
    test "sends an email when user roles changes" do
      admin = insert(:user, %{email: "example@email.com", roles: ["admin"]})
      email = Stitch.Accounts.Email.role_changed_email(admin, ["member"], ["multi-room-guest"])
      assert_delivered_email(email)
    end

    test "sends an email with the correct subject when guest type changed" do
      single_room_guest = insert(:user, %{email: "example@email.com", roles: ["single-room-guest"]})
      email = Stitch.Accounts.Email.role_changed_email(single_room_guest, ["multi-room-guest"], ["single-room-guest"])
      assert email.subject == "Guest Status Changed"
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
