defmodule Stitch.Engage.InboxAuthorizationTest do
  use Stitch.DataCase, async: true
  alias Stitch.Engage.InboxAuthorization

  describe "Stitch.Engage.InboxAuthorization.can_view/2" do
    setup _ do
      team = insert(:team)
      inbox = insert(:inbox, team: team)

      {:ok, team: team, inbox: inbox}
    end

    # USERS (PROVIDERS)

    test "returns true if user is team member", %{
      inbox: inbox,
      team: team
    } do
      team_member = insert(:user, team: team)
      assert InboxAuthorization.can_view?(inbox, team_member)
    end

    test "returns false if user is guest", %{
      inbox: inbox,
      team: team
    } do
      team_guest = insert(:user, team: team, roles: ["single-room-guest"])
      refute InboxAuthorization.can_view?(inbox, team_guest)
    end

    test "returns false if user is admin on other team", %{inbox: inbox} do
      other_team = insert(:team)
      other_team_admin = insert(:user, team: other_team, roles: ["admin"])
      refute InboxAuthorization.can_view?(inbox, other_team_admin)
    end

    # PATIENTS

    test "returns true if patient is team member", %{
      inbox: inbox,
      team: team
    } do
      team_patient = insert(:patient, team: team)
      assert InboxAuthorization.can_view?(inbox, team_patient)
    end

    test "returns false if patient is not team member", %{inbox: inbox} do
      other_team_patient = insert(:patient, team: insert(:team))
      refute InboxAuthorization.can_view?(inbox, other_team_patient)
    end
  end

  describe "Stitch.Engage.InboxAuthorization.can_update/2" do
    setup _ do
      team = insert(:team)
      inbox = insert(:inbox, team: team)

      {:ok, team: team, inbox: inbox}
    end

    test "returns true if user is team admin", %{
      inbox: inbox,
      team: team
    } do
      team_admin = insert(:user, team: team, roles: ["admin"])
      assert InboxAuthorization.can_update?(inbox, team_admin)
    end

    test "returns false if user is team member", %{
      inbox: inbox,
      team: team
    } do
      team_member = insert(:user, team: team)
      refute InboxAuthorization.can_update?(inbox, team_member)
    end

    test "returns false if user is guest", %{
      inbox: inbox,
      team: team
    } do
      team_guest = insert(:user, team: team, roles: ["single-room-guest"])
      refute InboxAuthorization.can_update?(inbox, team_guest)
    end

    test "returns false if user is admin on other team", %{inbox: inbox} do
      other_team = insert(:team)
      other_team_admin = insert(:user, team: other_team, roles: ["admin"])
      refute InboxAuthorization.can_update?(inbox, other_team_admin)
    end
  end
end
