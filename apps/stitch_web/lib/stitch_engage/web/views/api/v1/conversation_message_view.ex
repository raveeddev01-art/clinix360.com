defmodule StitchEngage.Web.Api.V1.ConversationMessageView do
  alias Stitch.{
    Accounts.User,
    TeamPatient,
    Message.Reaction
  }

  alias Stitch.Web.Api.V1.MessagesHelper
  use Stitch.Web, :view

  @endpoint Stitch.Web.Endpoint

  def render("index.json", %{conversation_messages: conversation_messages}) do
    conversation_messages_json(conversation_messages)
  end

  def render("show.json", %{conversation_message: conversation_message}) do
    conversation_message_json(conversation_message, %{load_reactions: true})
  end

  def conversation_messages_json(conversation_messages) do
    Enum.map(conversation_messages, &conversation_message_json/1)
  end

  def conversation_message_json(conversation_message, %{load_reactions: true}) do
    [conversation_message] =
      Reaction.apply_reactions([conversation_message], :conversation_message)

    conversation_message_json(conversation_message)
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
      fields:
        MessagesHelper.render_fields(conversation_message, false, @endpoint.files_struct_url()),
      type: type(conversation_message.type),
      inserted_at: conversation_message.inserted_at,
      updated_at: conversation_message.updated_at,
      edited: !!conversation_message.edited_at,
      edited_at: conversation_message.edited_at,
      # commenting out as this column is changing
      # in another PS and unused for now
      # read_status: conversation_message.read_status,
      reactions_web: conversation_message.provider_reactions,
      patient_reactions_web: conversation_message.patient_reactions,
      link_previews: conversation_message.link_previews,
      request_id: conversation_message.request_id,
      upload_id: conversation_message.upload_id
    }
  end

  def sender_info(nil, nil), do: sender_info(nil)
  def sender_info(provider = %User{}, nil), do: sender_info(provider)
  def sender_info(nil, patient = %TeamPatient{}), do: sender_info(patient)
  def sender_info(_, _), do: sender_info(nil)

  def sender_info(nil), do: nil

  def sender_info(%{id: id, first_name: first_name, last_name: last_name}) do
    %{id: id, first_name: first_name, last_name: last_name}
  end

  def type("file_share"), do: "upload"
  def type(type), do: type
end
