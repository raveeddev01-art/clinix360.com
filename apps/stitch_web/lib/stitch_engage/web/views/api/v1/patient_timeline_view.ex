defmodule StitchEngage.Web.Api.V1.PatientTimelineView do
  use Stitch.Web, :view
  alias StitchEngage.Web.Api.V1.ConversationMessageView

  alias Stitch.{
    Paginator
  }

  def render("conversations_with_patient.json", %{
        conversations: %Paginator{data: conversations, meta: meta}
      }) do
    %{
      data: conversations_json(conversations),
      meta: meta
    }
  end

  def conversations_json(conversations) do
    conversations
    |> Enum.map(fn conversation ->
      latest_conversation_message =
        ConversationMessageView.conversation_message_json(
          conversation.latest_conversation_message,
          %{
            load_reactions: true
          }
        )

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
