defmodule Stitch.Accounts.EmailTest do
  use ExUnit.Case, async: true
  use Bamboo.Test
  import Stitch.Factory
  import Ecto.Query

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

  describe "Stitch.Accounts.Email.team_invitation/2" do
    test "sends an email with the invite token as the link" do
      team = insert(:team)
      user = insert(:user, %{email: "a@email.com", team_id: team.id, onboarded: false})
      test_invitation = insert(:invitation, %{user_id: user.id, team_id: team.id})
      query =
        from i in Stitch.Invitation,
        where: i.id == ^test_invitation.id,
        preload: [:user, :team]

      invitation = Stitch.Repo.one(query)
      email = Stitch.Accounts.Email.team_invitation("John Doe", invitation)
      assert_delivered_email(email)
    end
  end
end
