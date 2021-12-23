defmodule Stitch.Elasticsearch.MessageSearch do
  @moduledoc """
  Provides interface for querying and indexing Engage messages using ElasticSearch.
  """
  alias Stitch.{
    Accounts.User,
    Patient,
    ElasticsearchCluster,
    Elasticsearch.SearchQuery,
    Message,
    GroupQueries,
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
  def load_in_corrent_order(ordered_messages_ids, hits) do
    messages_map =
      Message
      |> where([cm], cm.id in ^ordered_messages_ids)
      |> preload([:user, :group])
      |> select([cm], {cm.id, cm})
      |> Repo.all()
      |> Map.new()
      |> IO.inspect(label: "messages map")

    hits_map =
      hits
      |> Enum.reduce(%{}, fn elem, acc ->
        Map.put(acc, elem["_source"]["message_id"], elem)
      end)

    for id <- ordered_messages_ids, messages_map[id] do
      conversation_message = messages_map[id]
      highlighted_text_content = get_in(hits_map, [id, "highlight", "text_content"]) || []
      highlighted_text_content = Enum.join(highlighted_text_content, " ")
      Map.put(conversation_message, :highlighted_text_content, highlighted_text_content)
    end
    |> IO.inspect(label: "here is last thing from message side ")
  end

  def load_from_store({:ok, %{"hits" => %{"hits" => hits}} = _result}) do
    hits
    |> Enum.map(& &1["_source"]["message_id"])
    |> load_in_corrent_order(hits)
  end

  def load_from_store(result, _search_params), do: result

  def search_for_params(current_user, search_params) do
    search_query =
      search_params
      |> Stitch.SearchInputParser.parse(current_user)
      |> IO.inspect(label: "here is Parser")
      |> restrict_visibility(current_user)
      |> IO.inspect(label: "here is current")
      |> SearchQuery.new()
      |> IO.inspect(label: "here is SearchQuery")
      |> SearchQuery.compose()
      |> IO.inspect(label: "here is compose")

    search_query
    |> do_search()
    |> IO.inspect(label: "here is do_search")
    |> load_from_store()
    |> IO.inspect(label: "here is load_from_store")
  end

  def restrict_visibility(search_params, %User{} = user) do
    group_ids = Map.get(search_params, :group_id)
    group_ids = GroupQueries.visible_group_ids(user, group_ids)

    search_params
    |> Map.put(:team_id, user.team_id)
    |> Map.put(:group_id, group_ids || [])
  end

  @spec do_search(map) :: elasticsearch_response
  def do_search(query) do
    Elasticsearch.post(ElasticsearchCluster, "/messages/_search", query)
  end

  @spec add_to_index(Message.t()) :: elasticsearch_response
  def add_to_index(message) do
    message = Repo.preload(message, :group)
    Elasticsearch.put_document(ElasticsearchCluster, message, "messages")
  end

  @spec delete_from_index(Message.t()) :: elasticsearch_response
  def delete_from_index(message) do
    Elasticsearch.delete_document(ElasticsearchCluster, message, "messages")
  end
end
