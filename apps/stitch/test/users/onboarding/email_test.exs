defmodule Stitch.User.Onboarding.EmailTest do
  use ExUnit.Case, async: true
  use Bamboo.Test
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.User.Onboarding.Email.confirmation_code_email/1" do
    test "sends an email with the confirmation code to the user" do
      user = insert(:user, %{email: "example@email.com", confirmation_code: "123123"})
      email = Stitch.User.Onboarding.Email.confirmation_code_email(user)
      assert_delivered_email(email)
    end
  end

  describe "Stitch.User.Onboarding.Email.team_invitation/3" do
    test "sends an email with the invite token as the link" do
      team = insert(:team)
      user = insert(:user, %{invite_token: "abc", email: "a@email.com", team_id: team.id})
      email = Stitch.User.Onboarding.Email.team_invitation("Sergio Tapia", "Care Clinic", user)
      assert_delivered_email(email)
    end
  end
end
