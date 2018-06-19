defmodule Stitch.Engage.ConversationAuthorization do
  @moduledoc """
  Authorization module for conversation related logic.
  See InboxAuthorization as well.
  """

  alias Stitch.{
    Repo,
    TeamAuthorization,
    Accounts.User,
    Engage.Conversation
  }

  @doc """
  Given a conversation and user. Check if user can view.
  """
  @spec can_view?(Conversation.t(), User.t()) :: boolean
  def can_view?(conversation, current_user) do
    full_member_of_conversations_team?(conversation, current_user)
  end

  @doc """
  Given a conversation and user. Check if user can update.
  """
  @spec can_update?(Conversation.t(), User.t()) :: boolean
  def can_update?(conversation, current_user) do
    full_member_of_conversations_team?(conversation, current_user)
  end

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
end
