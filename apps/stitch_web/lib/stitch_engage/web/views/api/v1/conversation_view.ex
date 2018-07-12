defmodule StitchEngage.Web.Api.V1.ConversationView do
  use Stitch.Web, :view
  alias Stitch.Web.Api.V1.PatientView
  alias StitchEngage.Web.Api.V1.ConversationMessageView

  def render("index.json", %{conversations: conversations}) do
    conversations_json(conversations)
  end

  def render("patient_index.json", %{conversations: conversations}) do
    patient_conversations_json(conversations)
  end

  def render("show.json", %{conversation: conversation}) do
    conversation_json_with_messages(conversation)
  end

  def render("patient_show.json", %{conversation: conversation}) do
    patient_conversation_json_with_messages(conversation)
  end

  def patient_conversations_json(conversations) do
    Enum.map(conversations, &patient_conversation_json_with_latest/1)
  end

  def conversations_json(conversations) do
    Enum.map(conversations, &conversation_json_with_latest/1)
  end

  defp conversation_json(conversation) do
    patient = conversation.patients |> List.first()
    patient_json = PatientView.patient_json(patient)

    %{
      id: conversation.id,
      inbox_id: conversation.inbox_id,
      open: conversation.open,
      subject: conversation.subject,
      patient: patient_json,
      inserted_at: conversation.inserted_at,
      updated_at: conversation.updated_at,
      is_unread: Map.get(conversation, :is_unread)
    }
  end

  defp patient_conversation_json(conversation) do
    %{
      id: conversation.id,
      subject: conversation.subject,
      inbox_id: conversation.inbox_id,
      inserted_at: conversation.inserted_at,
      updated_at: conversation.updated_at,
      is_unread: Map.get(conversation, :is_unread)
    }
  end

  def patient_conversation_json_with_latest(conversation) do
    conversation
    |> patient_conversation_json()
    |> with_latest_message(conversation.latest_conversation_message)
  end

  def conversation_json_with_latest(conversation) do
    conversation
    |> conversation_json()
    |> with_latest_message(conversation.latest_conversation_message)
  end

  defp conversation_json_with_messages(conversation) do
    conversation
    |> conversation_json()
    |> with_messages(conversation.conversation_messages)
  end

  defp patient_conversation_json_with_messages(conversation) do
    conversation
    |> patient_conversation_json()
    |> with_messages(conversation.conversation_messages)
  end

  defp with_messages(json_map, messages) do
    conversation_messages_json = ConversationMessageView.conversation_messages_json(messages)
    Map.merge(json_map, %{conversation_messages: conversation_messages_json})
  end

  defp with_latest_message(json_map, latest_message) when is_nil(latest_message) do
    Map.merge(json_map, %{latest_conversation_message: nil})
  end

  defp with_latest_message(json_map, latest_message) do
    latest_message_json =
      ConversationMessageView.conversation_message_json(latest_message, %{load_reactions: true})

    Map.merge(json_map, %{latest_conversation_message: latest_message_json})
  end
end
