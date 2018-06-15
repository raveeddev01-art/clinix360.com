defmodule Stitch.Engage.ConversationQueries do
  @moduledoc """
  Queries used for Conversation and conversation-related logic.
  """

  import Ecto.Query

  alias Stitch.{
    Repo,
    Engage.Conversation,
    Engage.Inbox,
    Engage.ConversationMessage
  }

  def for_inbox_view(inbox_id) do
    Conversation
    |> for_inbox(inbox_id)
    |> with_patients()
    |> with_latest_messages(1)
    |> Repo.all()
  end

  def for_show_view(conversation_id) do
    Conversation
    |> where(id: ^conversation_id)
    |> with_patients()
    |> with_latest_messages(Conversation.page_length())
    |> Repo.one()
  end

  @doc """
  Given an inbox or inbox_id and optional sub-query. Return a list of conversations for that inbox.
  """
  def for_inbox(query \\ Conversation, inbox_id)

  def for_inbox(query, %Inbox{} = inbox) do
    for_inbox(query, inbox.id)
  end

  def for_inbox(query, inbox_id) do
    query |> where(inbox_id: ^inbox_id)
  end

  def with_patients(query) do
    query |> preload(team_patients: :patient)
  end

  def with_latest_messages(query, message_count) do
    latest_message_query =
      from(m in ConversationMessage, order_by: m.inserted_at, limit: ^message_count)

    from(convo in query, preload: [conversation_messages: ^latest_message_query])
  end

  def latest_open_for_inbox(inbox) do
    # TODO: extract this a bit better
    inbox.id
    |> for_inbox()
    |> where(open: true)
    |> most_recent(Conversation.page_length())
    |> with_patients()
    |> with_latest_messages(1)
    |> Repo.all()
  end

  def open_count_for_inbox(inbox) do
    count_by_open_val(inbox, true)
  end

  def closed_count_for_inbox(inbox) do
    count_by_open_val(inbox, false)
  end

  defp count_by_open_val(inbox, open_val) do
    query =
      inbox.id
      |> for_inbox()
      |> where(open: ^open_val)

    Repo.one(from(c in query, select: count("*")))
  end

  defp most_recent(query, count) do
    # TODO: Conversation messages would need to touch
    # the conversation for this to work. What to do?
    from(m in query, order_by: [desc: m.updated_at], limit: ^count)
  end
end
