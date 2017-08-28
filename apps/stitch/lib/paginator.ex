defmodule Stitch.Paginator do
  import Ecto.Query
  alias Stitch.Repo
  alias Stitch.Paginator

  defstruct [:data, :meta]

  def new(query, params) do
    {skip, params} = get_skip_value(params)
    {limit, params} = get_limit_value(params)

    %Paginator{
      data: data(query, skip, limit),
      meta: meta(query, skip, limit)
    }
  end

  defp get_skip_value(params) do
    {skip, params} = Map.pop(params, :skip)
    {skip, _} = Integer.parse(skip)
    skip = if skip > 0, do: skip, else: 0
    {skip, params}
  end

  defp get_limit_value(params) do
    {limit, params} = Map.pop(params, :limit)
    {limit, _} = Integer.parse(limit)
    limit = if limit > 0, do: limit, else: 0
    limit = if limit > 50, do: 50, else: limit
    {limit, params}
  end

  defp meta(query, skip, limit) do
    %{
      skip: skip,
      limit: limit,
      count: count(query)
    }
  end

  defp data(query, skip, limit) do
    query
    |> limit([q], ^limit)
    |> offset([q], ^skip)
    |> Repo.all
  end

  defp count(query) do
    count = query
    |> exclude(:order_by)
    |> exclude(:preload)
    |> exclude(:select)
    |> select([e], count(e.id))
    |> Repo.one
  end
end  