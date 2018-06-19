defmodule Stitch.Engage.ConversationQueries do
  @moduledoc """
  Queries used for Conversation and conversation-related logic.
  """

  import Ecto.Query

  alias Stitch.{
    Repo,
    Engage.Conversation,
    Engage.ConversationMessage
  }

  @doc """
  Given an index and (potentially nil) updated_before and is_open values
  Load the list of conversations for the index and any necessary relationships
  """
  @spec for_index(integer, binary | nil, boolean | nil) :: list(Conversation.t())
  def for_index(inbox_id, updated_before, is_open) do
    Conversation
    |> where(inbox_id: ^inbox_id)
    |> with_open_value(is_open)
    |> updated_before(updated_before)
    |> most_recent(Conversation.page_length())
    |> with_patients()
    |> Repo.all()
    |> with_latest_message_for_each()
  end

  @doc """
  Given an inbox id, load a page of open conversations, most_recent message
  for each of the conversations and patients in each conversation
  """
  @spec latest_open_for_inbox(integer | binary) :: list(Conversation.t())
  def latest_open_for_inbox(inbox_id) do
    Conversation
    |> where(inbox_id: ^inbox_id)
    |> where(open: true)
    |> most_recent(Conversation.page_length())
    |> with_patients()
    |> Repo.all()
    |> with_latest_message_for_each()
  end

  @doc """
  Given an inbox id, return the total count of open conversations.
  """
  @spec open_count_for_inbox(integer | binary) :: integer
  def open_count_for_inbox(inbox_id) do
    count_by_open_val(inbox_id, true)
  end

  @doc """
  Given an inbox id, return the total count of closed conversations.
  """
  @spec closed_count_for_inbox(integer | binary) :: integer
  def closed_count_for_inbox(inbox_id) do
    count_by_open_val(inbox_id, false)
  end

  @doc """
  Given a conversation id, load the conversation and any necessary relationships
  """
  @spec for_show(integer | binary) :: Conversation.t() | nil
  def for_show(conversation_id) do
    conversation =
      Conversation
      |> where(id: ^conversation_id)
      |> with_patients()
      |> Repo.one()

    case conversation do
      nil -> nil
      conversation -> with_latest_messages(conversation, ConversationMessage.page_length())
    end
  end

  # ===========
  #   PRIVATE
  # ===========

  defp with_patients(query) do
    query |> preload(team_patients: :patient)
  end

  defp with_latest_message_for_each(conversations) do
    # TODO: actually get latest for each (in a performat way)
    # This will likelu change significantly, and potentiall be
    # executed before the Repo.all()
<<<<<<< HEAD
    Enum.map(conversations, &Map.merge(&1, %{latest_conversation_message: nil}))
=======
    Enum.map(conversations, &inefficiently_get_and_merge_latest_message/1)
  end

  defp inefficiently_get_and_merge_latest_message(conversation) do
    # TODO: this is an awful N+1.
    # I am merging this to unblock the frontend for now.
    # DO NOT ship without this figured out.
    latest_message =
      ConversationMessage
      |> where(conversation_id: ^conversation.id)
      |> order_by(desc: :inserted_at)
      |> limit(1)
      |> Repo.one()

    Map.merge(conversation, %{latest_conversation_message: latest_message})
>>>>>>> develop
  end

  defp with_latest_messages(%Conversation{id: id} = conversation, message_count) do
    latest_message_query =
      from(
        m in ConversationMessage,
<<<<<<< HEAD
        where: m.id == ^id,
=======
        where: m.conversation_id == ^id,
>>>>>>> develop
        order_by: m.inserted_at,
        limit: ^message_count
      )

    Map.merge(conversation, %{conversation_messages: Repo.all(latest_message_query)})
  end

  defp count_by_open_val(inbox_id, open_val) do
    query =
      Conversation
      |> where(inbox_id: ^inbox_id)
      |> where(open: ^open_val)

    Repo.one(from(c in query, select: count("*")))
  end

  defp most_recent(query, count) do
    # TODO: ConversationMessages touch conversations on create
    from(m in query, order_by: [desc: m.updated_at], limit: ^count)
  end

  defp with_open_value(query, open_val) when is_nil(open_val), do: query

  defp with_open_value(query, open_val) do
    query |> where(open: ^open_val)
  end

  defp updated_before(query, updated_at_limit) when is_nil(updated_at_limit), do: query

  defp updated_before(query, updated_at_limit) do
    from(m in query, where: m.updated_at < ^updated_at_limit)
  end
end
