defmodule Stitch.MessageQueries do
  @moduledoc """
  Module in charge of all message related queries.
  """

  alias Stitch.{Repo, Group, Message}
  import Ecto.Query

  @doc """
  Return the latest 30 messages for a group.
  """
  def group_latest_messages(group_id) do
    query =
      from m in Message,
      where: m.group_id == ^group_id,
      order_by: [asc: :inserted_at],
      select: m,
      preload: [:user, :group]
    Repo.all(query)
  end
end