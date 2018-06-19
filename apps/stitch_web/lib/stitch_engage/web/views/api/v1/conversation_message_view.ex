defmodule StitchEngage.Web.Api.V1.ConversationMessageView do
  alias Stitch.{Accounts.User, TeamPatient}

  use Stitch.Web, :view

  def render("index.json", %{conversation_messages: conversation_messages}) do
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
      provider_id: conversation_message.provider_id,
      patient_id: conversation_message.team_patient_id,
      user: sender_info(conversation_message.provider, conversation_message.team_patient),
      conversation_id: conversation_message.conversation_id,
      deleted: conversation_message.deleted,
      text_content: conversation_message.text_content,
      fields: %{},
      type: conversation_message.type,
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

  def sender_info(nil, nil), do: sender_info(nil)
  def sender_info(provider = %User{}, nil), do: sender_info(provider)
  def sender_info(nil, patient = %TeamPatient{}), do: sender_info(patient)
  def sender_info(_, _), do: sender_info(nil)

  def sender_info(nil), do: nil

  def sender_info(%{user: user}) do
    %{id: user.id, first_name: user.first_name, last_name: user.last_name}
  end
end
