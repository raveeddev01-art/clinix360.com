defmodule Stitch.Engage.ConversationMessage.ConversationMessageCreation do
  @moduledoc """
  Handles creation of ConversationMessages in Engage.
  Similar to MessageCreation module for Connect.
  """
  use Ecto.Schema

  alias Ecto.Multi

  alias Stitch.{
    Repo,
    Accounts.User,
    Engage.Conversation,
    Engage.ConversationMessage,
    Patient,
    ReadStatus,
    Mobile.ConversationMessageNotificationQueue
  }

  @doc """
  Creates a ConversationMessage:
  - creates message
  - increments unread count
  - makes message as read for sender
  - kicks off related tasks
  """
  @spec create(Conversation.t(), User.t() | Patient.t(), map) :: {:ok, map} | {:error, term}
  def create(
        %Conversation{} = conversation,
        %User{} = provider_sender,
        attrs
      ) do
    conversation = Repo.preload(conversation, [:providers, :patients])

    {read_status_map, provider_recipient_ids} =
      ReadStatus.get_read_status(:conversation_message, conversation.providers, provider_sender)

    attrs = Map.merge(attrs, %{"provider_read_status" => read_status_map})

    struct = %ConversationMessage{
      conversation_id: conversation.id,
      provider_id: provider_sender.id
    }

    increment_provider_unread_query =
      ReadStatus.increment_unread_counter(
        :conversation_message_provider,
        conversation.id,
        provider_recipient_ids
      )

    increment_patient_unread_query =
      ReadStatus.increment_unread_counter(
        :conversation_message_patient,
        conversation.id,
        Enum.map(conversation.patients, & &1.id)
      )

    Multi.new()
    |> Multi.insert(:conversation_message, ConversationMessage.changeset(struct, attrs))
    |> Multi.update_all(:increment_provider_unread_counter, increment_provider_unread_query, [])
    |> Multi.update_all(:increment_patient_unread_counter, increment_patient_unread_query, [])
    |> ReadStatus.mark_as_read_on_creation(
      conversation,
      provider_sender,
      :conversation_message
    )
    |> Repo.transaction()
    |> post_creation()
  end

  def create(%Conversation{} = conversation, %Patient{} = patient_sender, attrs) do
    struct = %ConversationMessage{
      conversation_id: conversation.id,
      patient_id: patient_sender.id
    }

    conversation = Repo.preload(conversation, [:providers])
    providers = conversation.providers

    provider_ids = Enum.map(providers, & &1.id)

    increment_provider_unread_query =
      ReadStatus.increment_unread_counter(
        :conversation_message_provider,
        conversation.id,
        provider_ids
      )

    Multi.new()
    |> Multi.insert(:conversation_message, ConversationMessage.changeset(struct, attrs))
    |> Multi.update_all(:increment_provider_unread_counter, increment_provider_unread_query, [])
    |> Repo.transaction()
    |> post_creation()
  end

  defp post_creation({:ok, %{conversation_message: conversation_message}} = transaction_response) do
    # Notifications: send necessary notifications here.
    # TODO: get active users that should be notified based on their mobile notification settings.
    notify_user_ids = %{mobile_active: []}

    ConversationMessageNotificationQueue.async_enqueue_for_users(
      notify_user_ids.mobile_active,
      message.id
    )

    # Analytics: add something like `track_conversation_message_sent(conversation_message, sender, conversation)`

    Stitch.Elasticsearch.ConversationMessageSearch.add_to_index(conversation_message)
    transaction_response
  end

  defp post_creation(transaction_response), do: transaction_response
end
