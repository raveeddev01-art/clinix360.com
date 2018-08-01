defmodule Stitch.ElasticsearchStore do
  @behaviour Elasticsearch.Store
  import Ecto.Query
  alias Stitch.Repo

  alias Stitch.{
    Repo,
    Accounts.User,
    Engage.Conversation,
    Engage.ConversationMessage
  }

  def load(ConversationMessage = schema, offset, limit) do
    schema
    |> offset(^offset)
    |> limit(^limit)
    |> preload(conversation: :inbox)
    |> Repo.all()
  end

  def load(schema, offset, limit) do
    schema
    |> offset(^offset)
    |> limit(^limit)
    |> Repo.all()
  end
end
