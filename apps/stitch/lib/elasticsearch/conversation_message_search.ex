defmodule Stitch.Elasticsearch.ConversationMessageSearch do
  @moduledoc """
  Provides interface for querying and indexing Engage messages using ElasticSearch.
  """
  alias Stitch.{
    Accounts.User,
    Patient,
    ElasticsearchCluster,
    Elasticsearch.SearchQuery,
    Engage.ConversationMessage,
    Engage.ConversationQueries,
    Message.Reaction,
    Paginator,
    Repo
  }

  import Ecto.Query

  @type elasticsearch_response :: {:ok, map} | {:error, Elasticsearch.Exception.t()}
  @type conversation_message_author :: User.t() | Patient.t()

  @doc """
  This is needed beucase by default, the ES order is lost after the records are fetched from Repo.
  """
  def load_in_corrent_order(ordered_conversation_messages_ids, hits) do
    conversation_messages_map =
      ConversationMessage
      |> where([cm], cm.id in ^ordered_conversation_messages_ids)
      |> preload([:provider, :patient])
      |> select([cm], {cm.id, cm})
      |> Repo.all()
      |> Map.new()

    hits_map =
      hits
      |> Enum.reduce(%{}, fn elem, acc ->
        Map.put(acc, elem["_source"]["conversation_message_id"], elem)
      end)

    for id <- ordered_conversation_messages_ids,
        conversation_messages_map[id] do
      conversation_message = conversation_messages_map[id]
      highlighted_text_content = get_in(hits_map, [id, "highlight", "text_content"]) || []
      highlighted_text_content = Enum.join(highlighted_text_content, " ")
      Map.put(conversation_message, :highlighted_text_content, highlighted_text_content)
    end
  end

  def load_from_store({:ok, %{"hits" => %{"hits" => hits}} = result}, search_query) do
    conversation_message_ids = Enum.map(hits, & &1["_source"]["conversation_message_id"])

    data =
      conversation_message_ids
      |> load_in_corrent_order(hits)
      |> Reaction.apply_reactions(:conversation_message)

    meta = %{
      skip: search_query["from"] || 0,
      limit: search_query["size"],
      count: result["hits"]["total"]
    }

    {:ok, %Paginator{data: data, meta: meta}}
  end

  def load_from_store(result, _search_params), do: result

  def search_for_params(user_or_patient, search_params) do
    search_query =
      search_params
      |> restrict_visibility(user_or_patient)
      |> search()
      |> SearchQuery.compose()

    search_query
    |> do_search()
    |> load_from_store(search_query)
  end

  def restrict_visibility(search_params, %Patient{} = patient) do
    conversation_ids = Map.get(search_params, "conversation_id")

    available_conversation_ids =
      ConversationQueries.visible_patient_conversation_ids(patient, conversation_ids)

    search_params
    |> Map.put(:team_id, patient.team_id)
    |> Map.put(:conversation_id, available_conversation_ids || [])
  end

  def restrict_visibility(search_params, %User{} = provider) do
    search_params
    |> Map.put(:team_id, provider.team_id)
  end

  @doc """
  Ex.

      ConversationMessageSearch.search(%{
        term: "term",
        order: :relevance,
        after: datetie,
        before: datetime,
        current_user: current_user,
        author: author,
        conversation_id: 1
    })
  """
  @spec search(map) :: elasticsearch_response
  def search(search_params) do
    search_params
    |> update_in([:author], &author_id/1)
    |> SearchQuery.new()
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
    conversation_message = Repo.preload(conversation_message, conversation: :inbox)

    Elasticsearch.put_document(
      ElasticsearchCluster,
      conversation_message,
      "conversation_messages"
    )
  end

  @spec delete_from_index(ConversationMessage.t()) :: elasticsearch_response
  def delete_from_index(conversation_message) do
    Elasticsearch.delete_document(
      ElasticsearchCluster,
      conversation_message,
      "conversation_messages"
    )
  end
end
