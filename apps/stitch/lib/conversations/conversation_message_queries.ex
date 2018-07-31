defmodule Stitch.Engage.ConversationMessageQueries do
  alias Stitch.{
    Engage.ConversationMessage,
    Repo
  }

  @spec get_by_id(pos_integer) :: ConversationMessage.t() | nil

  def get_by_id(conversation_message_id, opts \\ [])

  def get_by_id(conversation_message_id, preload_assoc: true) do
    conversation_message = Repo.get(ConversationMessage, conversation_message_id)
    Repo.preload(conversation_message, [:patient, :provider])
  end

  def get_by_id(conversation_message_id, _opts) do
    Repo.get(ConversationMessage, conversation_message_id)
  end
end
