defmodule Stitch.ElasticsearchStore do
  require Logger

  @behaviour Elasticsearch.Store
  import Ecto.Query

  alias Stitch.{
    Repo
  }

  @impl true
  def stream(schema) do
    Repo.stream(schema)
  end

  @impl true
  def transaction(fun) do
    {:ok, result} = Repo.transaction(fun, timeout: :infinity)
    result
  end

  def load(schema, offset, limit) do
    Logger.info("Loading messages for #{inspect(%{offset: offset, limit: limit})}")

    result =
      schema
      |> offset(^offset)
      |> limit(^limit)
      |> preload(:group)
      |> Repo.all()

    Logger.info(
      "Loading #{Enum.count(result)} messages for #{inspect(%{offset: offset, limit: limit})}"
    )

    result
  end
end
