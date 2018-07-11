defmodule Stitch.Engage.ConversationAuthorizationTest do
  use Stitch.DataCase, async: true
  alias Stitch.Engage.ConversationAuthorization

  describe "Stitch.Engage.ConversationAuthorization: for providers" do
    setup _ do
      team = insert(:team)
      inbox = insert(:inbox, team: team)
      conversation = insert(:conversation, inbox: inbox)

      {:ok, conversation: conversation, team: team}
    end

    test "returns true if user is on team", %{
      conversation: conversation,
      team: team
    } do
      team_member = insert(:user, team: team)
      assert ConversationAuthorization.can_view?(conversation, team_member)
      assert ConversationAuthorization.can_update?(conversation, team_member)
      assert ConversationAuthorization.can_message?(conversation, team_member)
    end

    test "returns false if the provider is on other team (even if admin)", %{
      conversation: conversation
    } do
      other_team = insert(:team)
      non_author_admin = insert(:user, team: other_team, username: "admin", roles: ["admin"])

      refute ConversationAuthorization.can_view?(conversation, non_author_admin)
      refute ConversationAuthorization.can_update?(conversation, non_author_admin)
      refute ConversationAuthorization.can_message?(conversation, non_author_admin)
    end

    test "returns false if the provider is guest on team", %{
      conversation: conversation,
      team: team
    } do
      guest_on_team = insert(:user, team: team, username: "admin", roles: ["single-room-guest"])
      refute ConversationAuthorization.can_view?(conversation, guest_on_team)
      refute ConversationAuthorization.can_update?(conversation, guest_on_team)
      refute ConversationAuthorization.can_message?(conversation, guest_on_team)
    end
  end

  describe "Stitch.Engage.ConversationAuthorization: for patients" do
    setup _ do
      team = insert(:team)
      inbox = insert(:inbox, team: team)
      conversation = insert(:conversation, inbox: inbox)
      patient = insert(:patient, team: team)
      insert(:conversation_patient, patient: patient, conversation: conversation)

      {:ok, conversation: conversation, team: team, patient: patient}
    end

    test "can view and message if part of conversation", %{
      conversation: conversation,
      patient: patient
    } do
      assert ConversationAuthorization.can_view?(conversation, patient)
      assert ConversationAuthorization.can_message?(conversation, patient)
      refute ConversationAuthorization.can_update?(conversation, patient)
    end

    test "can not view, message, or update if not part of conversation", %{
      conversation: conversation,
      team: team
    } do
      other_patient = insert(:patient, team: team)
      refute ConversationAuthorization.can_view?(conversation, other_patient)
      refute ConversationAuthorization.can_message?(conversation, other_patient)
      refute ConversationAuthorization.can_update?(conversation, other_patient)
    end
  end
end
