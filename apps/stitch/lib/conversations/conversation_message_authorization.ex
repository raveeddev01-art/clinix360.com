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
    TeamAuthorization
  }

  @spec can_delete?(ConversationMessage.t(), Conversation.t(), User.t()) :: boolean
  def can_delete?(%ConversationMessage{provider_id: id}, _, %User{id: id}) do
    # user sent the message
    true
  end

  def can_delete?(_conversation_message, conversation, current_user) do
    admin_on_team?(conversation, current_user)
  end

  @spec can_edit?(ConversationMessage.t(), User.t()) :: boolean
  def can_edit?(%ConversationMessage{provider_id: id}, %User{id: id}) do
    # user sent the message
    true
  end

  def can_edit?(_, _), do: false

  # ===========
  #   PRIVATE
  # ===========

  defp admin_on_team?(conversation, user) do
    %{inbox: %{team_id: team_id}} = Repo.preload(conversation, :inbox)
    TeamAuthorization.is_admin?(user, team_id)
  end
end
