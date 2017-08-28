defmodule Stitch.MessageQueries do
  @moduledoc """
  Module in charge of all message related queries.
  """

  alias Stitch.{Repo, Group, Message, MessageAction}
  import Ecto.Query

  @doc """
  Returns messages for the user that matches the search term
  provided.
  """
  def search(user_id, term, opts \\ []) do
    # TODO: only search against messsages the user has access to.
    # Public groups, dms, multi-dms, etc.
    limit = Keyword.get(opts, :limit, 30)
    query =
      from m in Message,
      where: fragment("? % ?", m.text_content, ^term),
      order_by: fragment("similarity(?, ?) DESC", m.text_content, ^term)),
      order_by: [desc: :inserted_at],
      limit: ^limit,
      select: m,
      preload: [:user, :group, :pinned_by]

    query =
      case Keyword.fetch(opts, :max_id) do
        {:ok, max_id} ->
          query |> where([m], m.id < ^max_id)
        :error ->
          query
      end

    messages = Repo.all(query)
    messages = MessageAction.apply_user_message_actions(user, messages)
    messages
  end

  @doc """
  Return the latest 30 messages for a group.
  """
  def group_latest_messages(group_id, user, opts \\ []) do
    limit = Keyword.get(opts, :limit, 30)

    query =
      from m in Message,
      where: m.group_id == ^group_id,
      order_by: [desc: :inserted_at],
      limit: ^limit,
      select: m,
      preload: [:user, :group, :pinned_by]

    query = case Keyword.fetch(opts, :max_id) do
      {:ok, max_id} -> query |> where([m], m.id < ^max_id)
      :error -> query
    end

    messages = Repo.all(query)
    messages = MessageAction.apply_user_message_actions(user, messages)
    messages
  end

  def get_by_id(id) do
    message = Repo.get(Message, id)
    message = Repo.preload(message, [:user, :group])
    message
  end

  def load_info(message) do
    Repo.preload(message, [:pinned_by, :user])
  end
end
