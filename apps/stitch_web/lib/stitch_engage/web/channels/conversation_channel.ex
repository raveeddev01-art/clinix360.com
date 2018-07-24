defmodule StitchEngage.Web.ConversationChannel do
  @moduledoc """
  Handles engage conversations channel actions and broadcasts.
  """

  use Stitch.Web, :channel

  alias Stitch.{
    Repo,
    Engage.Conversation,
    Engage.ConversationAuthorization,
    Message.Reaction
  }

  alias StitchEngage.Web.Api.V1.ConversationMessageView

  @endpoint Stitch.Web.Endpoint

  # ===========
  #   JOINING
  # ===========

  def join("conversations:" <> conversation_id, _params, socket) do
    user_or_patient = socket.assigns.current_user || socket.assigns.patient

    with {:conversation, %Conversation{} = conversation} <-
           {:conversation, Repo.get(Conversation, conversation_id)},
         {:authorized?, true} <-
           {:authorized?, ConversationAuthorization.can_view?(conversation, user_or_patient)} do
      {:ok, %{}, assign(socket, :conversation, conversation)}
    else
      {:authorized?, false} ->
        {:error, %{message: "You cannot participate in this conversation."}}

      {:conversation, nil} ->
        {:error, %{message: "Conversation cannot be found."}}
    end
  end

  # ==============
  #   BROADCASTS
  # ==============

  def broadcast_message_created(conversation_message) do
    conversation = Repo.get(Conversation, conversation_message.conversation_id)

    conversation_message_json =
      ConversationMessageView.render("show.json", %{conversation_message: conversation_message})

    @endpoint.broadcast(
      "conversations:#{conversation.id}",
      "new_conversation_message",
      conversation_message_json
    )
  end

  def broadcast_message_edited(conversation_message) do
    conversation = Repo.get(Conversation, conversation_message.conversation_id)

    conversation_message_json =
      ConversationMessageView.render("show.json", %{conversation_message: conversation_message})

    @endpoint.broadcast(
      "conversations:#{conversation.id}",
      "edited_conversation_message",
      conversation_message_json
    )
  end

  def broadcast_message_deleted(%{conversation_id: conversation_id, id: id}) do
    conversation = Repo.get(Conversation, conversation_id)

    @endpoint.broadcast("conversations:#{conversation.id}", "deleted_conversation_message", %{
      id: id
    })
  end

  def broadcast_read_status(conversation, conversation_messages) do
    read_status_json =
      Enum.reduce(conversation_messages, %{}, &Map.put(&2, &1.id, &1.provider_read_status))

    @endpoint.broadcast("conversations:#{conversation.id}", "read_status_update", %{
      conversation_messages: read_status_json
    })
  end

  def broadcast_msg_link_previews_generated(conversation = %Conversation{}, conversation_message) do
    conversation_message_json =
      ConversationMessageView.render("show.json", %{conversation_message: conversation_message})

    @endpoint.broadcast(
      "conversations:#{conversation.id}",
      "conversation_message_link_previews_generated",
      conversation_message_json
    )
  end

  def broadcast_msg_link_preview_deleted(
        conversation = %Conversation{},
        conversation_message_id,
        link
      ) do
    @endpoint.broadcast(
      "conversations:#{conversation.id}",
      "conversation_message_link_preview_deleted",
      %{
        conversation_message_id: conversation_message_id,
        link: link
      }
    )
  end

  def broadcast_reactions_updated(conversation, conversation_message) do
    [conversation_message] =
      Reaction.apply_reactions([conversation_message], :conversation_message)

    @endpoint.broadcast("conversations:#{conversation.id}", "reactions_updated", %{
      conversation_message_id: conversation_message.id,
      reactions_web: conversation_message.provider_reactions,
      patient_reactions_web: conversation_message.patient_reactions
    })
  end
end
