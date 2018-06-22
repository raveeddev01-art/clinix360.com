defmodule Stitch.Engage.ConversationAuthorizationTest do
  use Stitch.DataCase, async: true
  alias Stitch.Engage.ConversationAuthorization

  describe "Stitch.Engage.ConversationAuthorization all permissions" do
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
end
