defmodule Stitch.TimedMessageHelperTest do
  use ExUnit.Case, async: true
  import Stitch.Factory
  alias Stitch.{Repo, TimedMessage.Helper}

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  # ===============
  #  SEND IF RULES
  # ===============

  describe "Stitch.TimedMessage.Helper.is_active_user" do
    test "sends with an active user" do
      user = insert(:user, onboarded: true)
      assert Helper.is_active_user(%{"user" => user}) === :ok
    end

    test "not sendable with a disabled user" do
      user = insert(:user, onboarded: false)
      assert Helper.is_active_user(%{"user" => user}) === :not_sendable
    end
  end

  describe "Stitch.TimedMessage.Helper.has_team" do
    test "sends with a team" do
      team = insert(:team)
      user = insert(:user, team: team, onboarded: true)
      assert Helper.has_team(%{"user" => user}) === :ok
    end

    test "not sendable without a team" do
      user = insert(:user, onboarded: true, team: nil)
      assert Helper.has_team(%{"user" => user}) === :not_sendable
    end
  end

  describe "Stitch.TimedMessage.Helper.is_active_and_has_team" do
    test "sends with a user and team" do
      team = insert(:team)
      user = insert(:user, team: team, onboarded: true)
      assert Helper.is_active_and_has_team(%{"user" => user}) === :ok
    end

    test "not sendable without a team" do
      user = insert(:user, onboarded: true, team: nil)
      assert Helper.is_active_and_has_team(%{"user" => user}) === :not_sendable
    end

    test "not sendable when invavtie team" do
      team = insert(:team)
      user = insert(:user, team: team, onboarded: false)
      assert Helper.is_active_and_has_team(%{"user" => user}) === :not_sendable
    end
  end

  describe "Stitch.TimedMessage.Helper.has_not_invited_users" do
    test "sends when there are no invites" do
      team = insert(:team)
      user = insert(:user, team: team)
      user_with_invitations = Repo.preload(user, team: :invitations)

      assert Helper.has_not_invited_users(%{"user" => user_with_invitations}) === :ok
    end

    test "not sendable if an invite has been sent" do
      team = insert(:team)
      user = insert(:user, team: team)
      user2 = insert(:user, team: team)
      invite = insert(:invitation, user: user2, team: team)
      user_with_invitations = Repo.preload(user, team: :invitations)

      assert Helper.has_not_invited_users(%{"user" => user_with_invitations}) === :not_sendable
    end
  end

  describe "Stitch.TimedMessage.Helper.has_not_set_profile" do
    test "sends with a default pic" do
      default_url = "https://s3.amazonaws.com/stitch-content/MT.png"
      user = insert(:user, profile_image_url: default_url)

      assert Helper.has_not_set_profile(%{"user" => user}) === :ok
    end

    test "not sendable with a custom pic" do
      custom_url = "https://s3.amazonaws.com/stitch-content/some_custom_content_for_user.png"
      user = insert(:user, profile_image_url: custom_url)

      assert Helper.has_not_set_profile(%{"user" => user}) === :not_sendable
    end
  end

  describe "Stitch.TimedMessage.Helper.is_invitation_pending" do
    test "sends with an unaccepted invite" do
      team = insert(:team)
      user = insert(:user, team: team)
      invitation = insert(:invitation, user: user, team: team)

      assert Helper.is_invitation_pending(%{"invitation" => invitation}) === :ok
    end

    test "not sendable with an accepted invite" do
      team = insert(:team)
      user = insert(:user, team: team)
      invitation = insert(:invitation, user: user, team: team, accepted: true)

      assert Helper.is_invitation_pending(%{"invitation" => invitation}) === :not_sendable
    end
  end

  describe "Stitch.TimedMessage.Helper.user_has_invite_permissions" do
    test "sends when team allows open invites" do
      team = insert(:team, open_invitations_enabled: true)
      user = insert(:user, team: team)

      assert Helper.user_has_invite_permissions(%{"user" => user}) === :ok
    end

    test "not sendable when team disallows open invites" do
      team = insert(:team, open_invitations_enabled: false)
      user = insert(:user, team: team)

      assert Helper.user_has_invite_permissions(%{"user" => user}) === :not_sendable
    end
  end
end
