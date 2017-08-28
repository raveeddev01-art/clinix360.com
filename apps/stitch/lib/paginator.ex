defmodule Stitch.Paginator do
  import Ecto.Query
  alias Stitch.Repo
  alias Stitch.Paginator

  defstruct [:data, :meta]

  @min_limit 0
  @max_limit 50
  @default_limit 10

  @min_skip 0
  @default_skip 0

  def new(query, params) do
    {skip, params} = get_skip_value(params)
    {limit, params} = get_limit_value(params)

    %Paginator{
      data: data(query, skip, limit),
      meta: meta(query, skip, limit)
    }
  end

  defp get_skip_value(params) do
    {skip, params} = Keyword.pop(params, :skip, @min_skip)
    skip = to_int(skip)
    skip = if skip > @default_skip, do: skip, else: @default_skip
    {skip, params}
  end

  defp get_limit_value(params) do
    {limit, params} = Keyword.pop(params, :limit, @default_limit)
    limit = to_int(limit)
    limit = if limit > @min_limit, do: limit, else: @min_limit
    limit = if limit > @max_limit, do: @max_limit, else: limit
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

  defp to_int(i) when is_integer(i), do: i
  defp to_int(s) when is_binary(s) do
    case Integer.parse(s) do
      {i, _} -> i
      :error -> :error
    end
  end
end  