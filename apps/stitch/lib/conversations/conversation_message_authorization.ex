defmodule Stitch.Engage.ConversationMessageAuthorization do
  @moduledoc """
  Authorization module for conversation message related logic.
  See ConversationAuthorization and InboxAuthorization as well.
  """

  alias Stitch.{
    Repo,
    Accounts.User,
    Engage.Conversation,
    Engage.ConversationMessage,
    Patient,
    TeamAuthorization
  }

  @spec can_delete?(ConversationMessage.t(), Conversation.t(), User.t() | Patient.t()) :: boolean
  def can_delete?(%ConversationMessage{provider_id: id}, _, %User{id: id}) do
    # user sent the message
    true
  end

  def can_delete?(_conversation_message, conversation, %User{} = current_user) do
    admin_on_team?(conversation, current_user)
  end

  def can_delete?(_, _, _), do: false

  @spec can_edit?(ConversationMessage.t(), User.t() | Patient.t()) :: boolean
  def can_edit?(%ConversationMessage{provider_id: id}, %User{id: id}) do
    # user sent the message
    true
  end

  def can_edit?(_, _), do: false

  @spec can_delete_link_preview?(
          ConversationMessage.t(),
          Conversation.t(),
          User.t() | Patient.t()
        ) :: boolean
  def can_delete_link_preview?(%ConversationMessage{patient_id: id}, _, %Patient{id: id}) do
    # patient sent the message
    true
  end

  def can_delete_link_preview?(message, conversation, user) do
    can_delete?(message, conversation, user)
  end

  # ===========
  #   PRIVATE
  # ===========

  defp admin_on_team?(conversation, user) do
    %{inbox: %{team_id: team_id}} = Repo.preload(conversation, :inbox)
    TeamAuthorization.is_admin?(user, team_id)
  end
end
