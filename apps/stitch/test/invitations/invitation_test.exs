defmodule Stitch.InvitationTest do
  use Stitch.DataCase, async: true
  alias Stitch.Invitation

  describe "invite_as_single_room_guest/2" do
    setup do
      team = insert(:team)
      admin = insert(:user, team: team, username: "admin", roles: ["admin"])
      group = insert(:group, team: team)
      {:ok, team: team, group: group, admin: admin}
    end

    test "creates an invitation", %{team: team, group: group, admin: admin} do
      params = %{email: "test@test.com", group_id: group.id}
      assert {:ok, invitation} = Invitation.invite_as_single_room_guest(admin, team, params)
      assert invitation.team_id == team.id

      user = Stitch.Repo.get(Stitch.Accounts.User, invitation.user_id)
      assert user.roles == ["single-room-guest"]
      assert user.groups_as_guest == [group.id]
    end

    test "gives error for bad email", %{team: team, group: group, admin: admin} do
      params = %{email: "test", group_id: group.id}
      assert {:error, changeset} = Invitation.invite_as_single_room_guest(admin, team, params)
      assert hd(errors_on(changeset).email) =~ "format"
    end

    test "gives error for missing email", %{team: team, group: group, admin: admin} do
      params = %{email: nil, group_id: group.id}
      assert {:error, changeset} = Invitation.invite_as_single_room_guest(admin, team, params)
      assert hd(errors_on(changeset).email) =~ "blank"

      params = %{group_id: group.id}
      assert {:error, changeset} = Invitation.invite_as_single_room_guest(admin, team, params)
      assert hd(errors_on(changeset).email) =~ "blank"
    end

    test "gives error for missing group_id", %{team: team, admin: admin} do
      params = %{email: "test@test.com"}
      assert {:error, changeset} = Invitation.invite_as_single_room_guest(admin, team, params)
      assert hd(errors_on(changeset).group_id) =~ "blank"
    end

    test "gives error for bad group_id", %{team: team, admin: admin} do
      params = %{email: "test@test.com", group_id: -1}
      assert {:error, errors} = Invitation.invite_as_single_room_guest(admin, team, params)
      assert errors =~ "Invalid group id"
    end

    test "gives error for duplicate emails under the same team", %{admin: admin, team: team, group: group} do
      user = insert(:user, team: team)
      params = %{email: user.email, group_id: group.id}
      assert {:error, errors} = Invitation.invite_as_single_room_guest(admin, team, params)
      assert errors =~ "Email has already been registered"
    end
  end

  describe "invite_as_multi_room_guest/2" do
    setup do
      team = insert(:team)
      admin = insert(:user, team: team, username: "admin", roles: ["admin"])

      groups =
        for _ <- 1..3 do
          :group
          |> insert(team: team)
          # |> clear_assoc(:team)
          # |> clear_assoc(:creator)
        end

      group_ids = for group <- groups, do: group.id
      {:ok, team: team, admin: admin, group_ids: group_ids}
    end

    test "creates an invitation", %{team: team, group_ids: group_ids, admin: admin} do
      params = %{email: "test@test.com", group_ids: group_ids}
      assert {:ok, invitation} = Invitation.invite_as_multi_room_guest(admin, team, params)
      assert invitation.team_id == team.id

      user = Stitch.Repo.get(Stitch.Accounts.User, invitation.user_id)
      assert user.roles == ["multi-room-guest"]
      assert user.groups_as_guest == group_ids
    end

    test "gives error for bad email", %{team: team, group_ids: group_ids, admin: admin} do
      params = %{email: "test", group_ids: group_ids}
      assert {:error, changeset} = Invitation.invite_as_multi_room_guest(admin, team, params)
      assert hd(errors_on(changeset).email) =~ "format"
    end

    test "gives error for missing email", %{team: team, group_ids: group_ids, admin: admin} do
      params = %{email: nil, group_ids: group_ids}
      assert {:error, changeset} = Invitation.invite_as_multi_room_guest(admin, team, params)
      assert hd(errors_on(changeset).email) =~ "blank"

      params = %{group_ids: group_ids}
      assert {:error, changeset} = Invitation.invite_as_multi_room_guest(admin, team, params)
      assert hd(errors_on(changeset).email) =~ "blank"
    end

    test "gives error for missing group_ids", %{team: team, admin: admin} do
      params = %{email: "test@test.com"}
      assert {:error, changeset} = Invitation.invite_as_multi_room_guest(admin, team, params)
      assert hd(errors_on(changeset).group_ids) =~ "blank"
    end

    test "gives error for a bad group_id in group_ids", %{team: team, group_ids: group_ids, admin: admin} do
      params = %{email: "test@test.com", group_ids: group_ids ++ [-1]}
      assert {:error, reason} = Invitation.invite_as_multi_room_guest(admin, team, params)
      assert reason =~ "Invalid group ids"
    end

    test "requires at least one group id", %{team: team, admin: admin} do
      params = %{email: "test@test.com", group_ids: []}
      assert {:error, changeset} = Invitation.invite_as_multi_room_guest(admin, team, params)
      assert hd(errors_on(changeset).group_ids) =~ "at least 1"
    end

    test "gives error for duplicate emails under the same team", %{admin: admin, team: team, group_ids: group_ids} do
      user = insert(:user, team: team)
      params = %{email: user.email, group_ids: group_ids}
      assert {:error, reason} = Invitation.invite_as_multi_room_guest(admin, team, params)
      assert reason =~ "Email has already been registered"
    end
  end

  describe "Stitch.Invitation.invite_to_team/2" do
    test "creates a user and invites to team" do
      team = insert(:team, %{open_invitations_enabled: true})
      user = insert(:user, %{team_id: team.id, roles: ["admin"]})
      {:ok, invitation} = Stitch.Invitation.invite_to_team(user, "example@email.com")
      assert invitation.team_id == team.id
      assert invitation.user_id != nil
      assert invitation.accepted == false
      assert String.length(invitation.invite_token) == 32
    end

    test "returns error when inviting blacklisted email" do
      team = insert(:team, %{open_invitations_enabled: true})
      user = insert(:user, %{team_id: team.id, roles: ["admin"]})
      {:error, reason} = Stitch.Invitation.invite_to_team(user, "example@qq.com")
      assert reason == "Email isn't valid."
    end

    test "returns error when account with that email already exists on team" do
      team = insert(:team, %{open_invitations_enabled: true})
      user = insert(:user, %{team_id: team.id, roles: ["admin"]})
      _existing_user = insert(:user, %{team_id: team.id, email: "example@email.com"})
      {:error, reason} = Stitch.Invitation.invite_to_team(user, "example@email.com")
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
      {:ok, invitation} = Stitch.Invitation.invite_to_team(user, "example@email.com")

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
      {:ok, invitation} = Stitch.Invitation.invite_to_team(user, "example@email.com")

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
