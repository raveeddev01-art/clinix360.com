defmodule Stitch.StarrableItems.StarrableItemQueries do
  import Ecto.Query

  alias Stitch.{
    MessageAction,
    Paginator
  }

  def user_starred_items(user_id, opts \\ []) do
    limit = Keyword.get(opts, :limit, 30)
    offset = Keyword.get(opts, :skip, 0)

    MessageAction
    |> join(:left, [ma], m in assoc(ma, :message))
    |> join(:left, [ma, m], u in assoc(ma, :upload))
    |> where([ma, m, u], ma.category == "star")
    |> where([ma, m, u], ma.user_id == ^user_id)
    |> where([ma, m, u], not is_nil(u.id) or m.type != "file_share")
    |> preload(:user)
    |> preload(:message)
    |> preload(:upload)
    |> Paginator.new(limit: limit, skip: offset)
  end
end
