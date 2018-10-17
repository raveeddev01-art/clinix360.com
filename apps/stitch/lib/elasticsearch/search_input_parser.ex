defmodule Stitch.SearchInputParser do
  def parse(%{term: term} = params, current_user) do
    result = parameterize(term)

    parsed_term =
      result.search_terms
      |> Enum.reverse()
      |> Enum.join(" ")

    params
    |> Map.put(:term, parsed_term)
    |> apply_room_filters(result.room_terms)
    |> apply_mentioned_user_ids_filters(result.messages_to_terms)
    |> apply_from_user_filters(result.messages_from_terms)
    |> apply_date_before_terms(result.date_before_terms, current_user)
    |> apply_date_after_terms(result.date_after_terms, current_user)
    |> apply_on_date_terms(result.date_on_terms, current_user)
  end

  def parameterize(term_string) do
    params = %{
      search_terms: [],
      room_terms: [],
      messages_to_terms: [],
      messages_from_terms: [],
      date_before_terms: [],
      date_after_terms: [],
      date_on_terms: []
    }

    term_string
    |> String.split()
    |> Enum.reduce(params, fn p, params ->
      Map.update!(params, modifier_to_key(p), fn ps -> [p | ps] end)
    end)
  end

  def modifier_to_key("in:" <> _), do: :room_terms
  def modifier_to_key("to:" <> _), do: :messages_to_terms
  def modifier_to_key("from:" <> _), do: :messages_from_terms
  def modifier_to_key("before:" <> _), do: :date_before_terms
  def modifier_to_key("after:" <> _), do: :date_after_terms
  def modifier_to_key("on:" <> _), do: :date_on_terms
  def modifier_to_key(_), do: :search_terms

  def apply_room_filters(query, room_terms), do: extract_ids(query, room_terms, :group_id)

  def apply_from_user_filters(query, from_user_terms),
    do: extract_ids(query, from_user_terms, :user_id)

  def apply_mentioned_user_ids_filters(query, mentioned_user_ids),
    do: extract_ids(query, mentioned_user_ids, :mentioned_user_ids)

  def extract_ids(query, [], _key), do: query

  def extract_ids(query, term_with_ids, key) do
    result =
      term_with_ids
      |> Enum.map(fn room_string ->
        result = room_string |> String.split(":") |> List.last()
        if result, do: String.to_integer(result), else: nil
      end)
      |> Enum.filter(&(&1 != nil))

    if Enum.empty?(result) do
      query
    else
      Map.put(query, key, result)
    end
  end

  def apply_date_before_terms(query, [], _current_user), do: query

  def apply_date_before_terms(query, date_before_terms, current_user) do
    earliest_date =
      date_before_terms
      |> Enum.map(fn term ->
        with date_string when not is_nil(date_string) <- String.split(term, ":") |> List.last(),
             {:ok, date} <- parse_date_string(date_string, current_user) do
          date
        end
      end)
      |> Enum.filter(&(&1 != nil))
      |> Enum.sort()
      |> List.first()

    if earliest_date do
      Map.put(query, :before, earliest_date)
    else
      query
    end
  end

  def apply_date_after_terms(query, [], _current_user), do: query

  def apply_date_after_terms(query, date_after_terms, current_user) do
    latest_date =
      date_after_terms
      |> Enum.map(fn term ->
        with date_string when not is_nil(date_string) <- String.split(term, ":") |> List.last(),
             {:ok, date} <- parse_date_string(date_string, current_user) do
          date
        end
      end)
      |> Enum.filter(&(&1 != nil))
      |> Enum.sort()
      |> List.last()

    if latest_date do
      Map.put(query, :after, latest_date)
    else
      query
    end
  end

  def parse_on_date(on_date, current_user) do
    case String.length(on_date) do
      4 ->
        with {:ok, date_string} <- Timex.parse(on_date, "{YYYY}") do
          {:ok,
           {Timex.beginning_of_year(date_string) |> convert_to_user_timezone(current_user),
            Timex.end_of_year(date_string) |> convert_to_user_timezone(current_user)}}
        end

      7 ->
        with {:ok, date_string} <- Timex.parse(on_date, "{0M}/{YYYY}") do
          {:ok,
           {Timex.beginning_of_month(date_string) |> convert_to_user_timezone(current_user),
            Timex.end_of_month(date_string) |> convert_to_user_timezone(current_user)}}
        end

      _ ->
        with {:ok, date_string} <- Timex.parse(on_date, "{0M}/{D}/{YYYY}") do
          {:ok,
           {Timex.beginning_of_day(date_string) |> convert_to_user_timezone(current_user),
            Timex.end_of_day(date_string) |> convert_to_user_timezone(current_user)}}
        end
    end
  end

  def apply_on_date_terms(query, [], _current_user), do: query

  def apply_on_date_terms(query, on_date_terms, current_user) do
    on_date =
      on_date_terms
      |> Enum.map(fn term ->
        date = String.split(term, ":") |> List.last()
        if date, do: date
      end)
      |> Enum.filter(&(&1 != nil))
      |> List.first()

    with on_date when not is_nil(on_date) <- on_date,
         {:ok, stand_and_end_datetimes} <- parse_on_date(on_date, current_user) do
      Map.put(query, :on_date, stand_and_end_datetimes)
    else
      _error -> query
    end
  end

  defp parse_date_string(string, current_user) do
    with {:ok, result} <- Timex.parse(string, "{0M}/{D}/{YYYY}") do
      {:ok, convert_to_user_timezone(result, current_user)}
    end
  end

  defp convert_to_user_timezone(datetime, current_user) do
    %{year: year, month: month, day: day, hour: hour, minute: minute, second: second} = datetime
    timezone = current_user.timezone["tz"] || "Etc/UTC"

    {{year, month, day}, {hour, minute, second}}
    |> Timex.to_datetime(timezone)
    |> Timex.Timezone.convert("Etc/UTC")
  end
end
