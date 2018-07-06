defmodule Stitch.Engage.ConversationAuthorization do
  @moduledoc """
  Authorization module for conversation related logic.
  See InboxAuthorization as well.
  """

  alias Stitch.{
    Accounts.User,
    Engage.Conversation,
    Patient,
    Repo,
    TeamAuthorization
  }

  @doc """
  Given a conversation and user or patient. Check viewing conversation is allowed.
  """
  @spec can_view?(Conversation.t(), User.t() | Patient.t()) :: boolean
  def can_view?(conversation, %User{} = current_user) do
    full_member_of_conversations_team?(conversation, current_user)
  end

  def can_view?(conversation, %Patient{id: patient_id}) do
    patient_in_conversation?(conversation, patient_id)
  end

  @doc """
  Given a conversation and user or patient. Check if can create a message.
  """
  @spec can_message?(Conversation.t(), User.t()) :: boolean
  def can_message?(conversation, %User{} = user) do
    full_member_of_conversations_team?(conversation, user)
  end

  def can_message?(conversation, %Patient{id: patient_id}) do
    patient_in_conversation?(conversation, patient_id)
  end

  @doc """
  Given a conversation and user or patient. Check if can update.
  """
  @spec can_update?(Conversation.t(), User.t()) :: boolean
  def can_update?(conversation, %User{} = user) do
    full_member_of_conversations_team?(conversation, user)
  end

  def can_update?(_conversation, %Patient{}), do: false

  # ===========
  #   PRIVATE
  # ===========

  defp full_member_of_conversations_team?(conversation, current_user) do
    %{inbox: %{team_id: team_id}} = Repo.preload(conversation, :inbox)
    is_full_team_member?(team_id, current_user)
  end

  defp is_full_team_member?(team_id, user) do
    TeamAuthorization.user_is_member?(team_id, user.id) && !User.guest?(user)
  end

  defp patient_in_conversation?(conversation, patient_id) do
    conversation = Repo.preload(conversation, :conversation_patients)

    !!Enum.find(
      conversation.conversation_patients,
      &(&1.patient_id == patient_id)
    )
  end
end
