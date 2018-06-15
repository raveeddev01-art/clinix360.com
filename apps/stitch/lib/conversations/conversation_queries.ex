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

  def for_index(inbox_id, updated_before, open_value) do
    Conversation
    |> for_inbox(inbox_id)
    |> with_open_value(open_value)
    |> updated_before(updated_before)
    |> most_recent(Conversation.page_length())
    |> with_patients()
    |> Repo.all()
    |> with_latest_message_for_each()
  end

  def for_show(conversation_id) do
    Conversation
    |> where(id: ^conversation_id)
    |> with_patients()
    |> with_latest_messages(Conversation.page_length())
    |> Repo.one()
  end

  def latest_open_for_inbox(inbox) do
    inbox.id
    |> for_inbox()
    |> where(open: true)
    |> most_recent(ConversationMessage.page_length())
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

  def with_latest_message_for_each(conversations) do
    # TODO: actually get latest for each (in a performat way)
    Enum.map(conversations, &Map.merge(&1, %{latest_conversation_message: nil}))
  end

  def with_latest_messages(query, message_count) do
    latest_message_query =
      from(m in ConversationMessage, order_by: m.inserted_at, limit: ^message_count)

    from(convo in query, preload: [conversation_messages: ^latest_message_query])
  end

  defp count_by_open_val(inbox, open_val) do
    query =
      inbox.id
      |> for_inbox()
      |> where(open: ^open_val)

    Repo.one(from(c in query, select: count("*")))
  end

  defp with_open_value(query, open_val) when is_nil(open_val), do: query

  defp with_open_value(query, open_val) do
    query |> where(open: ^open_val)
  end

  defp updated_before(query, updated_at_limit) when is_nil(updated_at_limit), do: query

  defp updated_before(query, updated_at_limit) do
    from(m in query, where: m.updated_at < ^updated_at_limit)
  end

  defp most_recent(query, count) do
    # TODO: ConversationMessages touch conversations on create
    from(m in query, order_by: [desc: m.updated_at], limit: ^count)
  end
end
