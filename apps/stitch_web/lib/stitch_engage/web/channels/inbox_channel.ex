defmodule StitchEngage.Web.InboxChannel do
  @moduledoc """
  Handles top-level engage channel actions and broadcasts.
  New Conversations and Inboxes. (anything do be displayed
  in Engage that does not live in the main panel)
  """

  use Stitch.Web, :channel

  alias Stitch.{
    Repo,
    Engage.Inbox,
    Engage.InboxAuthorization
  }

  alias StitchEngage.Web.Api.V1.ConversationView

  @endpoint Stitch.Web.Endpoint

  # ===========
  #   JOINING
  # ===========

  def join("inbox:" <> inbox_id, _params, socket) do
    user = socket.assigns.current_user

    with {:inbox, inbox} <- {:inbox, Repo.get(Inbox, inbox_id)},
         {:authorized?, true} <- {:authorized?, InboxAuthorization.can_view?(inbox, user)} do
      {:ok, socket}
    else
      {:inbox, _} ->
        {:error, %{message: "Inbox not found"}}

      {:authorized?, false} ->
        {:error, %{message: "Unauthorized"}}

      _ ->
        {:error, %{message: "Unauthorized"}}
    end
  end

  # ==============
  #   BROADCASTS
  # ==============

  def broadcast_conversation_creation(conversation) do
    conversation_json = ConversationView.conversation_json_with_latest(conversation)

    @endpoint.broadcast("inbox:#{conversation.inbox_id}", "conversation_created", %{
      conversation: conversation_json
    })
  end

  def broadcast_conversation_update(conversation) do
    # For opening and closing conversations
    # Also for latest_message updates (and reordering based on latest message times)
    conversation_json = ConversationView.conversation_json_with_latest(conversation)

    @endpoint.broadcast("inbox:#{conversation.inbox_id}", "conversation_updated", %{
      conversation: conversation_json
    })
  end
end
