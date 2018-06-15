defmodule StitchEngage.Web.Api.V1.ConversationMessageView do
  use Stitch.Web, :view

  def render("index.json", %{conversations: conversation_messages}) do
    conversation_messages_json(conversation_messages)
  end

  def render("show.json", %{conversation_message: conversation_message}) do
    conversation_message_json(conversation_message)
  end

  def conversation_messages_json(conversation_messages) do
    Enum.map(conversation_messages, &conversation_message_json/1)
  end

  def conversation_message_json(conversation_message) do
    %{
      id: conversation_message.id,
      text_content: conversation_message.text_content,
      deleted: conversation_message.deleted,
      type: conversation_message.type,
      fields: %{},
      provider_id: conversation_message.provider_id,
      patient_id: conversation_message.team_patient_id,
      provider: nil,
      patient: nil,
      inserted_at: conversation_message.inserted_at,
      updated_at: conversation_message.updated_at,
      edited: !!conversation_message.edited_at,
      edited_at: conversation_message.edited_at,
      read_status: conversation_message.read_status,
      reactions_web: %{},
      link_previews: [],
      request_id: conversation_message.request_id
    }
  end
end
