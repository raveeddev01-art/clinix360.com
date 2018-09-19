defmodule Stitch.ElasticsearchStore do
  @behaviour Elasticsearch.Store
  import Ecto.Query

  alias Stitch.{
    Repo
  }

  @impl true
  def load(schema, offset, limit) do
    schema
    |> offset(^offset)
    |> limit(^limit)
    |> preload(:group)
    |> Repo.all()
  end

  @impl true
  def transaction(fun) do
    {:ok, result} = Repo.transaction(fun, timeout: :infinity)
    result
  end
end
