defmodule Stitch.MessageQueries do
  @moduledoc """
  Module in charge of all message related queries.
  """

  alias Stitch.{Repo, Group, Message, MessageAction}
  import Ecto.Query

  @doc """
  Return the latest 30 messages for a group.
  """
  def group_latest_messages(group_id, opts \\ []) do
    limit = Keyword.get(opts, :limit, 30)

    query =
      from m in Message,
      where: m.group_id == ^group_id,
      order_by: [desc: :inserted_at],
      limit: ^limit,
      select: m,
      preload: [:user, :group]

    query = case Keyword.fetch(opts, :max_id) do
      {:ok, max_id} -> query |> where([m], m.id < ^max_id)
      :error -> query
    end

    Repo.all(query)
  end

  def get_by_id(id) do
    Repo.get(Message, id)
  end
end
