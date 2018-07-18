defmodule StitchEngage.Web.Api.V1.PatientTimelineView do
  use Stitch.Web, :view
  alias Stitch.Web.Api.V1.PatientView
  alias StitchEngage.Web.Api.V1.ConversationMessageView

  def render("conversations_with_patient.json", %{conversation_messages: conversation_messages}) do
    conversations_json(conversation_messages)
  end

  def conversations_json(conversation_messages) do
    conversation_messages
    |> Enum.map(fn conversation_message ->
      conversation = conversation_message.conversation

      # TODO: preload reactions
      latest_conversation_message =
        ConversationMessageView.conversation_message_json(conversation_message, %{
          load_reactions: true
        })

      %{
        id: conversation.id,
        inbox_id: conversation.inbox_id,
        open: conversation.open,
        subject: conversation.subject,
        inserted_at: conversation.inserted_at,
        updated_at: conversation.updated_at,
        latest_conversation_message: latest_conversation_message
      }
    end)
  end
end
