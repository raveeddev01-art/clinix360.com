defmodule Stitch.Engage.ConversationMessageAuthorizationTest.Helper do
  use Stitch.DataCase, async: true

  def setup do
    team = insert(:team)
    author = insert(:user, team: team)
    inbox = insert(:inbox, team: team)
    conversation = insert(:conversation, inbox: inbox)

    conversation_message =
      insert(:conversation_message, conversation: conversation, provider: author)

    patient = insert(:patient, team: team)

    message_from_patient =
      insert(:patient_conversation_message, conversation: conversation, patient: patient)

    {:ok,
     conversation_message: conversation_message,
     message_from_patient: message_from_patient,
     conversation: conversation,
     team: team,
     patient: patient,
     author: author}
  end
end

defmodule Stitch.Engage.ConversationMessageAuthorizationTest do
  use Stitch.DataCase, async: true
  alias Stitch.Engage.ConversationMessageAuthorization
  alias Stitch.Engage.ConversationMessageAuthorizationTest.Helper

  describe "Stitch.Engage.ConversationMessageAuthorization.can_edit?/2" do
    setup _, do: Helper.setup()

    test "returns true if the provider is the author", setup do
      assert ConversationMessageAuthorization.can_edit?(setup.conversation_message, setup.author)
    end

    test "returns false even if the patient is the author", setup do
      refute ConversationMessageAuthorization.can_edit?(setup.message_from_patient, setup.patient)
    end

    test "returns false if the provider is not author (even if admin)", setup do
      non_author_admin = insert(:user, team: setup.team, username: "admin", roles: ["admin"])

      refute ConversationMessageAuthorization.can_edit?(
               setup.conversation_message,
               non_author_admin
             )
    end
  end

  describe "Stitch.Engage.ConversationMessageAuthorization.can_delete?/3" do
    setup _, do: Helper.setup()

    test "returns true if the provider is the author", setup do
      assert ConversationMessageAuthorization.can_delete?(
               setup.conversation_message,
               setup.conversation,
               setup.author
             )
    end

    test "returns true if the provider is admin on team", setup do
      non_author_admin = insert(:user, team: setup.team, username: "admin", roles: ["admin"])

      assert ConversationMessageAuthorization.can_delete?(
               setup.conversation_message,
               setup.conversation,
               non_author_admin
             )
    end

    test "returns false if provider is not admin on team", setup do
      non_author_member = insert(:user, team: setup.team)

      refute ConversationMessageAuthorization.can_delete?(
               setup.conversation_message,
               setup.conversation,
               non_author_member
             )
    end

    test "returns false if provider is admin on different team", setup do
      other_team = insert(:team)
      other_team_admin = insert(:user, team: other_team, username: "admin", roles: ["admin"])

      refute ConversationMessageAuthorization.can_delete?(
               setup.conversation_message,
               setup.conversation,
               other_team_admin
             )
    end

    test "returns false if the patient is the author", setup do
      refute ConversationMessageAuthorization.can_delete?(
               setup.message_from_patient,
               setup.conversation,
               setup.patient
             )
    end
  end

  describe "Stitch.Engage.ConversationMessageAuthorization.can_delete_link_preview?/3" do
    setup _, do: Helper.setup()

    test "returns true if the provider is the author", setup do
      assert ConversationMessageAuthorization.can_delete_link_preview?(
               setup.conversation_message,
               setup.conversation,
               setup.author
             )
    end

    test "returns false if the provider is not author (even if admin)", setup do
      non_author_member = insert(:user, team: setup.team)

      refute ConversationMessageAuthorization.can_delete_link_preview?(
               setup.conversation_message,
               setup.conversation,
               non_author_member
             )
    end

    test "returns true if the patient is the author", setup do
      assert ConversationMessageAuthorization.can_delete_link_preview?(
               setup.message_from_patient,
               setup.conversation,
               setup.patient
             )
    end

    test "returns false if the patient is not the author", setup do
      other_patient_on_team = insert(:patient, team: setup.team)

      refute ConversationMessageAuthorization.can_delete_link_preview?(
               setup.message_from_patient,
               setup.conversation,
               other_patient_on_team
             )
    end
  end
end
