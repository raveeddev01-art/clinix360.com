defmodule Stitch.Paginator do
  import Ecto.Query
  alias Stitch.Repo
  alias Stitch.Paginator

  defstruct [:data, :meta]

  @type t :: %__MODULE__{data: data, meta: meta}
  @type meta :: %{skip: non_neg_integer, limit: pos_integer, count: non_neg_integer}
  @type data :: [any]

  @min_limit 0
  @max_limit 50
  @default_limit 10

  @min_skip 0
  @default_skip 0

  def new(query, params) do
    skip = get_skip_value(params)
    limit = get_limit_value(params)

    %Paginator{
      data: data(query, skip, limit),
      meta: meta(query, skip, limit)
    }
  end

  defp get_skip_value(params) do
    skip = Keyword.get(params, :skip, @min_skip) |> to_int
    skip = if skip > @default_skip, do: skip, else: @default_skip
    skip
  end

  defp get_limit_value(params) do
    limit = Keyword.get(params, :limit, @default_limit) |> to_int
    limit = if limit > @min_limit, do: limit, else: @min_limit
    limit = if limit > @max_limit, do: @max_limit, else: limit
    limit
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
    |> Repo.all()
  end

  defp count(query) do
    query
    |> exclude(:order_by)
    |> exclude(:group_by)
    |> exclude(:preload)
    |> exclude(:select)
    |> select([e], count(e.id))
    |> Repo.one()
  end

  defp to_int(i) when is_integer(i), do: i

  defp to_int(s) when is_binary(s) do
    case Integer.parse(s) do
      {i, _} -> i
      :error -> :error
    end
  end

  @doc """
  Generates pagination anchor tags.
  """
  @spec page_links(meta) :: :invalid_limit | iodata
  def page_links(%{skip: _skip, limit: 0, count: _count}),
    do: :invalid_limit
  def page_links(%{skip: skip, limit: limit,  count: count}) do
    page =
      skip / limit + 1
      |> round()
    total = Float.ceil(count/limit)
    do_page_links(page, total, limit)
  end

  defp do_page_links(page, total_pages, limit) do
    page
    |> generate_page_numbers(total_pages)
    |> generate_anchor_tags(limit)
  end

  defp generate_page_numbers(page, total_pages) do
    for i <- page-4..page+4 do
      cond do
        i < 1 -> :remove
        i > total_pages -> :remove
        i == page -> {i, :no_anchor}
        i -> {i, :anchor}
      end
    end
    |> Enum.reject(&(&1==:remove))
  end

  defp generate_anchor_tags(page_numbers, limit) do
    for {page, action} <- page_numbers do
      case action do
        :anchor ->
          Phoenix.HTML.Link.link(page, to: "?page=#{page}&limit=#{limit}")
        :no_anchor ->
          Phoenix.HTML.raw("<span>#{page}</span>")
      end
    end
  end
end
