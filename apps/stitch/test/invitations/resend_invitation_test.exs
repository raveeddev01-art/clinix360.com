defmodule Stitch.Invitation.ResendInvitationTest do
  use ExUnit.Case, async: true
  use Bamboo.Test
  import Stitch.Factory
  alias Stitch.Invitation

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "resend_invitation/2" do
    test "sends an email with the invite token as the link" do
      team = insert(:team)
      user = insert(:user, %{email: "a@email.com", team_id: team.id, onboarded: false})
      inviter = insert(:user, team: team, first_name: "John", last_name: "Doe", roles: ["admin"])
      invitation = insert(:invitation, %{user_id: user.id, team_id: team.id, invite_token: "abc"})

      {:ok, invitation} = Invitation.resend_invitation(inviter.id, invitation.id)

      email = Invitation.Email.team_invitation("John Doe", invitation)
      assert_delivered_email(email)
    end
  end
end
