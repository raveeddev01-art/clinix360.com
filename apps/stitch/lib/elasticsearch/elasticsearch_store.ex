defmodule Stitch.ElasticsearchStore do
  @behaviour Elasticsearch.Store
  import Ecto.Query

  alias Stitch.{
    Repo
  }

  def load(schema, offset, limit) do
    schema
    |> offset(^offset)
    |> limit(^limit)
    |> preload(:group)
    |> Repo.all()
  end
end
