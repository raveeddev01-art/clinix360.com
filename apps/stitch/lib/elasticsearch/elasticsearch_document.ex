defimpl Elasticsearch.Document, for: Stitch.Engage.ConversationMessage do
  alias Stitch.{
    Engage.ConversationMessage,
    Elasticsearch.ConversationMessageSearch
  }

  def id(conversation_message), do: conversation_message.id

  def encode(conversation_message) do
    %{
      title: conversation_message.text_content |> String.slice(0..20),
      author: author(conversation_message),
      text_content: conversation_message.text_content,
      inserted_at: inserted_at(conversation_message.inserted_at)
    }
  end

  def author(%ConversationMessage{patient_id: patient_id}) when is_integer(patient_id) do
    ConversationMessageSearch.search_author_id(:patient, patient_id)
  end

  def author(%ConversationMessage{provider_id: provider_id}) when is_integer(provider_id) do
    ConversationMessageSearch.search_author_id(:provider, provider_id)
  end

  def inserted_at(datetime) do
    datetime
    |> DateTime.from_naive!("Etc/UTC")
    |> DateTime.to_unix(:seconds)
  end
end
