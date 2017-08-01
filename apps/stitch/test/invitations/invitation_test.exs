defmodule Stitch.InvitationTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Invitation.list_team_invitations/1" do
    test "return error if team only allows admin and user isn't admin" do
      team = insert(:team, %{open_invitations_enabled: false})
      user = insert(:user, %{team_id: team.id, roles: ["member"]})
      {:error, reason} = Stitch.Invitation.list_team_invitations(user.id)
      assert reason == "User unauthorized to see list of invitations."
    end

    test "returns invitation list if team allows anyone to invite" do
      team = insert(:team, %{open_invitations_enabled: true})
      user = insert(:user, %{team_id: team.id, roles: ["member"]})
      user_b = insert(:user, %{team_id: team.id})
      user_c = insert(:user, %{team_id: team.id})

      insert(:invitation, %{user_id: user_b.id, team_id: team.id})
      insert(:invitation, %{user_id: user_c.id, team_id: team.id})

      invitations = Stitch.Invitation.list_team_invitations(user.id)
      assert Enum.count(invitations) == 2
    end

    test "returns invitation list if team only allows admins and user is admin" do
      team = insert(:team, %{open_invitations_enabled: false})
      user = insert(:user, %{team_id: team.id, roles: ["admin"]})
      user_b = insert(:user, %{team_id: team.id})
      user_c = insert(:user, %{team_id: team.id})

      insert(:invitation, %{user_id: user_b.id, team_id: team.id})
      insert(:invitation, %{user_id: user_c.id, team_id: team.id})

      invitations = Stitch.Invitation.list_team_invitations(user.id)
      assert Enum.count(invitations) == 2
    end
  end

  describe "Stitch.Invitation.resend_invitation/2" do
    test "return error if team only allows admin and user isn't admin" do
      team = insert(:team, %{open_invitations_enabled: false})
      user = insert(:user, %{team_id: team.id, roles: ["member"]})
      {:error, reason} = Stitch.Invitation.resend_invitation(user.id, 123)
      assert reason == "User unauthorized to resend invitation."
    end

    test "returns error if invitation has already been accepted" do
      team = insert(:team, %{open_invitations_enabled: false})
      user = insert(:user, %{team_id: team.id, roles: ["admin"]})
      invitation = insert(:invitation, %{user_id: user.id, team_id: team.id, accepted: true})
      {:error, reason} = Stitch.Invitation.resend_invitation(user.id, invitation.id)
      assert reason == "This invitation has been accepted already."
    end

    test "it resends the invitation" do
      team = insert(:team, %{open_invitations_enabled: false})
      user = insert(:user, %{team_id: team.id, roles: ["admin"]})
      invitation = insert(:invitation, %{user_id: user.id, team_id: team.id, accepted: false})
      {:ok, resent_invitation} = Stitch.Invitation.resend_invitation(user.id, invitation.id)
      assert resent_invitation.id == invitation.id
    end
  end

  describe "Stitch.Invitation.revoke/2" do
    test "return error if team only allows admin and user isn't admin" do
      team = insert(:team, %{open_invitations_enabled: false})
      user = insert(:user, %{team_id: team.id, roles: ["member"]})
      {:error, reason} = Stitch.Invitation.revoke(user.id, 123)
      assert reason == "User unauthorized to revoke invitation."
    end

    test "returns error if invitation has already been accepted" do
      team = insert(:team, %{open_invitations_enabled: false})
      user = insert(:user, %{team_id: team.id, roles: ["admin"]})
      invitation = insert(:invitation, %{user_id: user.id, team_id: team.id, accepted: true})
      {:error, reason} = Stitch.Invitation.resend_invitation(user.id, invitation.id)
      assert reason == "This invitation has been accepted already."
    end

    test "deletes the invitation" do
      team = insert(:team, %{open_invitations_enabled: false})
      user = insert(:user, %{team_id: team.id, roles: ["admin"]})
      invitation = insert(:invitation, %{user_id: user.id, team_id: team.id, accepted: false})
      {:ok, deleted_invitation} = Stitch.Invitation.revoke(user.id, invitation.id)
      assert deleted_invitation.id == invitation.id
    end
  end
end