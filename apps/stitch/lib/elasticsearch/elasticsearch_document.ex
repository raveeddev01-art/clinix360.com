defimpl Elasticsearch.Document, for: Stitch.Message do
  @text_style_regex [
    ~r/[_](.*)[_]/,
    ~r/[*](.*)[*]/,
    ~r/[`](.*)[`]/,
    ~r/[~](.*)[~]/
  ]

  def id(message), do: message.id

  def encode(message) do
    %{
      title: message.text_content |> String.slice(0..20),
      user_id: message.user_id,
      text_content: text_content(message.text_content),
      inserted_at: inserted_at(message.inserted_at),
      group_id: message.group_id,
      team_id: message.group.team_id,
      message_id: message.id,
      mentioned_user_ids: message.mentioned_user_ids
    }
  end

  defp text_content(text) do
    Enum.reduce @text_style_regex, text, fn regex, acc ->
      parse_text_styles(acc, regex)
    end
  end

  defp inserted_at(datetime) do
    datetime
    |> DateTime.from_naive!("Etc/UTC")
    |> DateTime.to_unix(:second)
  end

  defp parse_text_styles("", _regex), do: ""
  defp parse_text_styles(nil, _regex), do: ""
  defp parse_text_styles(text, regex), do: Regex.replace(regex, text, fn _, x -> "#{x}" end)

end
