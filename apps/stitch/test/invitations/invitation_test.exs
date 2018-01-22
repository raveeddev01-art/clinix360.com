defmodule Stitch.InvitationTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Invitation.invite_to_team/2" do
    test "creates a user and invites to team" do
      team = insert(:team, %{open_invitations_enabled: true})
      user = insert(:user, %{team_id: team.id, roles: ["admin"]})
      {:ok, invitation} = Stitch.Invitation.invite_to_team(user.id, "example@email.com")
      assert invitation.team_id == team.id
      assert invitation.user_id != nil
      assert invitation.accepted == false
      assert String.length(invitation.invite_token) == 32
    end

    test "returns error when inviting blacklisted email" do
      team = insert(:team, %{open_invitations_enabled: true})
      user = insert(:user, %{team_id: team.id, roles: ["admin"]})
      {:error, reason} = Stitch.Invitation.invite_to_team(user.id, "example@qq.com")
      assert reason == "Email isn't valid."
    end

    test "returns error when account with that email already exists on team" do
      team = insert(:team, %{open_invitations_enabled: true})
      user = insert(:user, %{team_id: team.id, roles: ["admin"]})
      _existing_user = insert(:user, %{team_id: team.id, email: "example@email.com"})
      {:error, reason} = Stitch.Invitation.invite_to_team(user.id, "example@email.com")
      assert reason == "Email has already been registered."
    end
  end

  describe "Stitch.Invitation.list_pending_team_invitations/1" do
    test "returns invitation list if team allows anyone to invite" do
      team = insert(:team, %{open_invitations_enabled: true})
      _user = insert(:user, %{team_id: team.id, roles: ["member"]})
      user_b = insert(:user, %{team_id: team.id})
      user_c = insert(:user, %{team_id: team.id})
      user_d = insert(:user, %{team_id: team.id})

      insert(:invitation, %{user_id: user_b.id, team_id: team.id})
      insert(:invitation, %{user_id: user_c.id, team_id: team.id})
      insert(:invitation, %{user_id: user_d.id, team_id: team.id, accepted: true})

      invitations = Stitch.Invitation.list_pending_team_invitations(team)
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
      {:error, reason} = Stitch.Invitation.revoke_invitation(user.id, 123)
      assert reason == "User unauthorized to revoke invitation."
    end

    test "returns error if invitation has already been accepted" do
      team = insert(:team, %{open_invitations_enabled: false})
      user = insert(:user, %{team_id: team.id, roles: ["admin"]})
      invitation = insert(:invitation, %{user_id: user.id, team_id: team.id, accepted: true})
      {:error, reason} = Stitch.Invitation.revoke_invitation(user.id, invitation.id)
      assert reason == "This invitation has been accepted already."
    end

    test "deletes the invitation" do
      team = insert(:team, %{open_invitations_enabled: false})
      user = insert(:user, %{team_id: team.id, roles: ["admin"]})
      invitation = insert(:invitation, %{user_id: user.id, team_id: team.id, accepted: false})
      {:ok, deleted_invitation} = Stitch.Invitation.revoke_invitation(user.id, invitation.id)
      assert deleted_invitation.id == invitation.id
    end
  end

  describe "Stitch.Invitation.accept_and_complete_onboarding/2" do
    test "gives error when token doesn't exist" do
      team = insert(:team, open_invitations_enabled: false)
      user = insert(:user, team_id: team.id, roles: ["admin"])
      _invitation = insert(:invitation, user_id: user.id, team_id: team.id, accepted: true)

      assert {:error, "Invitation does not exist."} = Stitch.Invitation.accept_and_complete_onboarding("42", %{})
    end

    test "gives error when username is invalid" do
      team = insert(:team, open_invitations_enabled: false)
      user = insert(:user, team_id: team.id, roles: ["admin"])
      {:ok, invitation} = Stitch.Invitation.invite_to_team(user.id, "example@email.com")

      assert {:error, changeset} = Stitch.Invitation.accept_and_complete_onboarding(invitation.invite_token, %{
        "fullname" => "Joe",
        "username" => "Joe",
        "password" => "Password1",
        "phone_number" => "1231231234",
        "pin" => "0000",
      })
      assert {"has invalid format", _} = changeset.errors[:username]
    end

    test "accepts invitation, adds user to the default group, creates a system message and creates a self DM" do
      team = insert(:team, open_invitations_enabled: false)
      user = insert(:user, team_id: team.id, roles: ["admin"])
      default_group = insert(:group, team: team, is_default: true)
      {:ok, invitation} = Stitch.Invitation.invite_to_team(user.id, "example@email.com")

      assert {:ok, %{user: user, groups: [group]}} = Stitch.Invitation.accept_and_complete_onboarding(invitation.invite_token, %{
        "fullname" => "Joe",
        "username" => "joe",
        "password" => "Password1",
        "phone_number" => "1231231234",
        "pin" => "0000",
      })

      assert user.email == "example@email.com"
      assert user.roles == ["member"]
      assert user.onboarded
      assert Stitch.Repo.get_by(Stitch.GroupUser, user_id: user.id, group_id: group.id)
      assert group.id == default_group.id
      assert Stitch.Repo.get_by Stitch.Group, %{
        name: "__dm_group__",
        slug: "__dm:#{user.id}.#{user.id}"
      }
    end
  end
end
