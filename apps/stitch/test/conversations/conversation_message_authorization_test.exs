defmodule Stitch.Engage.ConversationMessageAuthorizationTest do
  use Stitch.DataCase, async: true

  alias Stitch.{
    Accounts.User,
    Engage.Conversation,
    Engage.ConversationMessage
    Engage.ConversationMessageAuthorization,
  }

  describe "Stitch.Engage.ConversationMessageAuthorization.can_edit?/2" do
    setup _ do
      team = insert(:team)
      other_team = insert(:team)
      author = insert(:user, team: team)
      insert(:inbox, team: team)
      insert(:conversation, inbox: inbox)
      insert(:conversation_message, conversation: conversation, provider_id: author.id)

      {conversation_message: conversation_message, conversation: conversation, team: team, author: author}
    end

    test "returns true if the provider is the author", &{conversation_message: conversation_message, author: author} do
      assert ConversationMessageAuthorization.can_edit?(conversation_message, author)
    end

    test "returns false if the provider is not author (even if admin)", &{conversation_message: conversation_message, team: team} do
      non_author_admin = insert(:user, team: team, username: "admin", roles: ["admin"])
      refute ConversationMessageAuthorization.can_edit?(conversation_message, non_author_admin)
    end
  end

  describe "Stitch.Engage.ConversationMessageAuthorization.can_delete?/3" do
    setup _ do
      team = insert(:team)
      other_team = insert(:team)
      author = insert(:user, team: team)
      insert(:inbox, team: team)
      insert(:conversation, inbox: inbox)
      insert(:conversation_message, conversation: conversation, provider_id: author.id)

      {conversation_message: conversation_message, conversation: conversation, team: team, author: author}
    end

    test "returns true if the provider is the author", %{conversation_message: conversation_message, conversation: conversation, author: author} do
      assert ConversationMessageAuthorization.can_delete?(conversation_message, conversation, author)
    end

    test "returns true if the provider is admin on team" %{conversation_message: conversation_message, conversation: conversation, team: team} do
      non_author_admin = insert(:user, team: team, username: "admin", roles: ["admin"])
      assert ConversationMessageAuthorization.can_delete?(conversation_message, conversation, non_author_admin)
    end

    test "returns false if provider is not admin on team" %{conversation_message: conversation_message, conversation: conversation, team: team} do
      non_author_member = insert(:user, team: team)
      refute ConversationMessageAuthorization.can_delete?(conversation_message, conversation, non_author_member)
    end

    test "returns false if provider is admin on different team" %{conversation_message: conversation_message, conversation: conversation, team: team} do
      other_team = insert(:team)
      other_team_admin = insert(:user, team: other_team, username: "admin", roles: ["admin"])
      refute ConversationMessageAuthorization.can_delete?(conversation_message, conversation, other_team_admin)
    end
  end
end
