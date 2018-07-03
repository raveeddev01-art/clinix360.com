defmodule Stitch.Engage.ConversationMessage.ConversationMessageCreation do
  @moduledoc """
  Handles creation of ConversationMessages in Engage.
  Similar to MessageCreation module for Connect.
  """
  use Ecto.Schema

  alias Ecto.Multi

  alias Stitch.{
    Repo,
    ReadStatus,
    Accounts.User,
    Engage.Conversation,
    Engage.ConversationMessage
  }

  @doc """
  Creates a ConversationMessage:
  - creates message
  - increments unread count
  - makes message as read for sender
  - kicks off related tasks
  """
  @spec create(Conversation.t(), User.t(), map) :: {:ok, map} | {:error, term}
  def create(%Conversation{} = conversation, %User{} = provider_sender, attrs) do
    conversation = Repo.preload(conversation, [:providers])

    providers = conversation.providers

    {read_status_map, provider_recipient_ids} =
      ReadStatus.get_read_status(:conversation_message, providers, provider_sender)

    attrs = Map.merge(attrs, %{"read_status" => read_status_map})

    struct = %ConversationMessage{
      conversation_id: conversation.id,
      provider_id: provider_sender.id
    }

    increment_unread_query =
      ReadStatus.increment_unread_counter(
        :conversation_message,
        conversation.id,
        provider_recipient_ids
      )

    Multi.new()
    |> Multi.insert(:conversation_message, ConversationMessage.changeset(struct, attrs))
    |> Multi.update_all(:increment_unread_counter, increment_unread_query, [])
    |> ReadStatus.mark_as_read_on_creation(
      conversation,
      provider_sender,
      :conversation_message
    )
    |> Repo.transaction()
    |> post_creation()
  end

  defp post_creation(transaction_response) do
    # Notifications: send necessary notifications here.
    # Analytics: add something like `track_conversation_message_sent(conversation_message, sender, conversation)`
    transaction_response
  end
end
