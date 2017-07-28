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

  describe "Stitch.Accounts.Email.team_invitation/3" do
    test "sends an email with the invite token as the link" do
      team = insert(:team)
      user = insert(:user, %{invite_token: "abc", email: "a@email.com", team_id: team.id})
      email = Stitch.Accounts.Email.team_invitation("John Doe", team, user)
      assert_delivered_email(email)
    end
  end
end
