defmodule Stitch.Elasticsearch.ConversationMessageSearch do
  @moduledoc """
  Provides interface for querying and indexing Engage messages using ElasticSearch.
  """
  alias Stitch.{
    Accounts.User,
    Patient,
    ElasticsearchCluster,
    Elasticsearch.SearchQuery,
    Stitch.Engage.ConversationMessage
  }

  @type elasticsearch_response :: {:ok, map} | {:error, Elasticsearch.Exception.t()}
  @type conversation_message_author :: User.t() | Patient.t()

  @doc """
  Ex.

      ConversationMessageSearch.search(%{
        term: "term",
        order: :relevance,
        after: datetie,
        before: datetime,
        current_user: current_user,
        author: author
    })
  """
  @spec search(map) :: elasticsearch_response
  def search(search_params) do
    search_params = update_in(search_params, [:author], &author_id/1)

    search_params
    |> SearchQuery.new()
    |> SearchQuery.compose()
    |> do_search()
  end

  @spec author_id(conversation_message_author | nil) :: String.t() | nil
  def author_id(%User{} = user), do: search_author_id(:provider, user.id)
  def author_id(%Patient{} = user), do: search_author_id(:patient, user.id)
  def author_id(nil), do: nil

  @doc """
  Returns author field name in the ElasticSearch; used for search and index
  """
  @spec search_author_id(:patient | :provider, pos_integer) :: String.t()
  def search_author_id(:patient, id), do: "patient-#{id}"
  def search_author_id(:provider, id), do: "provider-#{id}"

  @spec do_search(map) :: elasticsearch_response
  def do_search(query) do
    Elasticsearch.post(ElasticsearchCluster, "/conversation_messages/_search", query)
  end

  @spec add_to_index(ConversationMessage.t()) :: elasticsearch_response
  def add_to_index(conversation_message) do
    Elasticsearch.put_document(
      ElasticsearchCluster,
      conversation_message,
      "conversation_messages"
    )
  end
end
