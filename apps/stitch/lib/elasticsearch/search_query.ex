defmodule Stitch.Elasticsearch.SearchQuery do
  @moduledoc """
  A module for composing ES search queries for both Engage and Connect message types.

  Exact search:
  > Search.mixed_exact_with_stemming ~s("ski")
  Matches only "ski" without "skies"

  Search with word stemming:
  > Search.mixed_exact_with_stemming ~s(ski)
  Matches both "ski" and "skies"

  Search words starting with tha given pattern
  > Search.mixed_exact_with_stemming ~s(res*)
  """
  alias Stitch.{
    Accounts.User,
    Elasticsearch.SearchQuery
  }

  defstruct term: nil,
            author: nil,
            order: nil,
            before: nil,
            after: nil,
            current_user: nil,
            conversation_id: nil,
            inbox_id: nil,
            team_id: nil,
            limit: nil,
            skip: nil

  @type t :: %SearchQuery{
          term: String.t() | nil,
          author: String.t() | nil,
          order: String.t() | nil,
          before: DateTime.t() | nil,
          after: DateTime.t() | nil,
          current_user: User.t() | nil,
          conversation_id: pos_integer | [pos_integer] | nil,
          inbox_id: pos_integer | [pos_integer] | nil,
          team_id: pos_integer | nil,
          limit: pos_integer | nil,
          skip: pos_integer | nil
        }

  @type elasticsearch_query :: map

  @highlight_tag "%&$&%"

  @max_limit 60

  @doc """
  Creates a SearchQuery struct

      SearchQuery.new(%{
        term: "search_term",
        author: "provider-1"
      })
  """
  @spec new(map) :: SearchQuery.t()
  def new(%{} = search_params) do
    search_query = %SearchQuery{order: :relevance}
    struct(search_query, search_params)
  end

  @spec compose(SearchQuery.t()) :: elasticsearch_query
  def compose(search_query) do
    %{query: %{bool: %{must: []}}}
    |> mixed_exact_with_stemming(search_query)
    |> filter_by_author(search_query)
    |> sort(search_query)
    |> before_filter(search_query)
    |> after_filter(search_query)
    |> conversation_filter(search_query)
    |> inbox_filter(search_query)
    |> team_filter(search_query)
    |> apply_limit(search_query)
    |> apply_skip(search_query)
    |> highlighter()
  end

  @spec apply_limit(elasticsearch_query, SearchQuery.t()) :: elasticsearch_query
  def apply_limit(query, %SearchQuery{} = search_query) do
    limit = Enum.min([search_query.limit, @max_limit])
    Map.put(query, "size", limit)
  end

  @spec apply_skip(elasticsearch_query, SearchQuery.t()) :: elasticsearch_query
  def apply_skip(query, %SearchQuery{skip: skip}) when is_integer(skip) do
    Map.put(query, "from", skip)
  end

  def apply_skip(query, _search_query), do: query

  @spec team_filter(elasticsearch_query, SearchQuery.t()) :: elasticsearch_query
  def team_filter(query, %SearchQuery{team_id: team_id}) when is_integer(team_id) do
    subquery = %{
      constant_score: %{
        filter: %{
          term: %{
            team_id: team_id
          }
        }
      }
    }

    add_must_field(query, subquery)
  end

  def team_filter(query, _search_query), do: query

  @spec inbox_filter(elasticsearch_query, SearchQuery.t()) :: elasticsearch_query
  def inbox_filter(query, %SearchQuery{inbox_id: inbox_id})
      when is_integer(inbox_id) or is_list(inbox_id) do
    subquery = %{
      constant_score: %{
        filter: %{
          terms: %{
            inbox_id: List.wrap(inbox_id)
          }
        }
      }
    }

    add_must_field(query, subquery)
  end

  def inbox_filter(query, _search_query), do: query

  @spec conversation_filter(elasticsearch_query, SearchQuery.t()) :: elasticsearch_query

  def conversation_filter(query, %SearchQuery{conversation_id: conversation_ids})
      when is_integer(conversation_ids) or is_list(conversation_ids) do
    subquery = %{
      constant_score: %{
        filter: %{
          terms: %{
            conversation_id: List.wrap(conversation_ids)
          }
        }
      }
    }

    add_must_field(query, subquery)
  end

  def conversation_filter(query, _search_query), do: query

  @spec before_filter(elasticsearch_query, SearchQuery.t()) :: elasticsearch_query
  def before_filter(query, %SearchQuery{
        before: %DateTime{} = before_datetime,
        current_user: %User{} = current_user
      }) do
    subquery = %{
      range: %{
        inserted_at: %{lte: convert_to_user_timezone(before_datetime, current_user)}
      }
    }

    add_must_field(query, subquery)
  end

  def before_filter(query, _search_query), do: query

  @spec after_filter(elasticsearch_query, SearchQuery.t()) :: elasticsearch_query
  def after_filter(query, %SearchQuery{
        after: %DateTime{} = after_timestamp,
        current_user: %User{} = current_user
      }) do
    subquery = %{
      range: %{
        inserted_at: %{lte: convert_to_user_timezone(after_timestamp, current_user)}
      }
    }

    add_must_field(query, subquery)
  end

  def after_filter(query, _search_query), do: query

  @doc """
  https://www.elastic.co/guide/en/elasticsearch/reference/master/mixing-exact-search-with-stemming.html
  """
  @spec mixed_exact_with_stemming(elasticsearch_query, SearchQuery.t()) :: elasticsearch_query
  def mixed_exact_with_stemming(query, %SearchQuery{term: term}) when is_binary(term) do
    subquery = %{
      simple_query_string: %{
        fields: ["text_content"],
        quote_field_suffix: ".exact",
        query: "#{term}"
      }
    }

    add_must_field(query, subquery)
  end

  def mixed_exact_with_stemming(query, _search_query), do: query

  @spec filter_by_author(elasticsearch_query, SearchQuery.t()) :: elasticsearch_query
  def filter_by_author(query, %SearchQuery{author: author}) when is_binary(author) do
    subquery = %{
      constant_score: %{
        filter: %{
          term: %{
            author: author
          }
        }
      }
    }

    add_must_field(query, subquery)
  end

  def filter_by_author(query, _search_query), do: query

  @spec highlighter(elasticsearch_query) :: elasticsearch_query
  def highlighter(query) do
    Map.put(query, :highlight, %{
      pre_tags: [@highlight_tag],
      post_tags: [@highlight_tag],
      fields: %{
        text_content: %{type: "plain"}
      }
    })
  end

  @spec sort(elasticsearch_query, SearchQuery.t()) :: SearchQuery.t()
  def sort(query, %SearchQuery{order: "recency"}) do
    Map.put(query, :sort, %{inserted_at: "desc"})
  end

  def sort(query, %SearchQuery{}), do: query

  @spec add_must_field(elasticsearch_query, any) :: elasticsearch_query
  def add_must_field(query, value) do
    update_in(query, [:query, :bool, :must], &[value | &1])
  end

  @spec convert_to_user_timezone(DateTime.t(), User.t()) :: integer
  def convert_to_user_timezone(datetime, user) do
    %{year: year, month: month, day: day, hour: hour, minute: minute, second: second} = datetime
    timezone = user.timezone["tz"] || "Etc/UTC"

    {{year, month, day}, {hour, minute, second}}
    |> Timex.to_datetime(timezone)
    |> Timex.Timezone.convert("Etc/UTC")
    |> DateTime.to_unix()
  end
end
