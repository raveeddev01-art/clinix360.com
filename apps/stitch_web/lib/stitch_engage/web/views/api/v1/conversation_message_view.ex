defmodule StitchEngage.Web.Api.V1.ConversationMessageView do
  alias Stitch.{
    Accounts.User,
    Patient,
    Message.Reaction
  }

  alias Stitch.Web.Api.V1.{
    MessagesHelper,
    PatientView,
    UserView
  }

  use Stitch.Web, :view

  @endpoint Stitch.Web.Endpoint

  def render("index.json", %{conversation_messages: conversation_messages}) do
    conversation_messages_json(conversation_messages)
  end

  def render("show.json", %{conversation_message: conversation_message}) do
    conversation_message_json(conversation_message, %{load_reactions: true})
  end

  def render("mark_as_read.json", %{
        conversation_messages_json: conversation_messages_json,
        conversation_user: conversation_user
      }) do
    %{
      conversation_messages: conversation_messages_json,
      conversation_id: conversation_user.conversation_id,
      last_read_at: conversation_user.last_read_at,
      unread_messages_count: conversation_user.unread_messages_count
    }
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
      patient_id: conversation_message.patient_id,
      user: sender_info(conversation_message.provider, conversation_message.patient),
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
      provider_reactions_web: conversation_message.provider_reactions,
      patient_reactions_web: conversation_message.patient_reactions,
      link_previews: conversation_message.link_previews,
      request_id: conversation_message.request_id,
      upload_id: conversation_message.upload_id,
      patient_read_status: conversation_message.patient_read_status,
      provider_read_status: conversation_message.provider_read_status
    }
  end

  def sender_info(nil, nil), do: nil
  def sender_info(provider = %User{}, nil), do: UserView.user_json(provider)
  def sender_info(nil, patient = %Patient{}), do: PatientView.patient_json(patient)
  def sender_info(_, _), do: nil

  def type("file_share"), do: "upload"
  def type(type), do: type

  def render("search.json", %Stitch.Paginator{data: data, meta: meta}) do
    %{
      data:
        Enum.map(data, fn record ->
          json = conversation_message_json(record)
          Map.put(json, :highlighted_text_content, record.highlighted_text_content)
        end),
      meta: meta
    }
  end
end
