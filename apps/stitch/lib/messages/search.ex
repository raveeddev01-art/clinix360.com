defmodule Stitch.Messages.Search do
  @moduledoc """
  Module in charge of all Message search functionality.
  """

  alias Stitch.{
    Repo,
    GroupUser,
    Message,
    MessageAction
  }

  import Ecto.Query

  # List of supported params:

  # DONE: medication
  # "medication changes"
  # walk -> walks, walking, walked
  # seren* -> serene, serenity, serendipity, serendipitous
  # teddy -bear

  # in:#emergency-room
  # in:@bharat,jonathan

  # to:@bharat
  # from:@bharat

  # before:3/30/2018
  # after:3/30/2018
  # on:3/30/2018
  # during: 3/30/2018

  def search(user, term_string, options \\ []) do
    params = parameterize(term_string)

    messages =
      from_users_groups(user.id, options)
      |> apply_date_before_terms(params[:date_before_terms])
      |> apply_date_after_terms(params[:date_after_terms])
      |> apply_date_on_terms(params[:date_on_terms])
      |> apply_search_terms(params[:search_terms])
      |> apply_exact_search_terms(params[:exact_search_terms])
      |> apply_room_filters(params[:room_terms])
      |> apply_to_user_filters(params[:messages_to_terms])
      |> apply_from_user_filters(params[:messages_from_terms])
      |> apply_highlight(params[:search_terms])
      |> Repo.all()

    user
    |> MessageAction.apply_user_message_actions(messages)
    |> Message.Reaction.apply_reactions()
  end

  def apply_highlight(query, search_terms) do
    search_term = Enum.join(search_terms, " | ")

    query =
      from(
        message in query,
        select: %{
          id: message.id,
          user_id: message.user_id,
          group_id: message.group_id,
          deleted: message.deleted,
          text_content: message.text_content,
          fields: message.fields,
          type: message.type,
          inserted_at: message.inserted_at,
          updated_at: message.updated_at,
          pinned: message.pinned,
          pinned_by_id: message.pinned_by_id,
          pinned_at: message.pinned_at,
          edited_at: message.edited_at,
          read_status: message.read_status,
          mentioned_user_ids: message.mentioned_user_ids,
          link_previews: message.link_previews,
          request_id: message.request_id,
          query: fragment("to_tsquery(?)", type(^search_term, :string))
        }
      )

    from(
      message in subquery(query),
      select: %Message{
        id: message.id,
        user_id: message.user_id,
        group_id: message.group_id,
        deleted: message.deleted,
        text_content: message.text_content,
        fields: message.fields,
        type: message.type,
        inserted_at: message.inserted_at,
        updated_at: message.updated_at,
        pinned: message.pinned,
        pinned_by_id: message.pinned_by_id,
        pinned_at: message.pinned_at,
        edited_at: message.edited_at,
        read_status: message.read_status,
        mentioned_user_ids: message.mentioned_user_ids,
        link_previews: message.link_previews,
        request_id: message.request_id,
        text_content: message.text_content,
        highlighted_text_content:
          fragment(
            "ts_headline(?, ?, 'StartSel = %&$&%, StopSel = %&$&%, MinWords = 9999, MaxWords = 10000')",
            message.text_content,
            message.query
          )
      }
    )
  end

  def apply_date_before_terms(query, []), do: query

  def apply_date_before_terms(query, date_before_terms) do
    Enum.reduce(date_before_terms, query, fn term, query ->
      date_string = String.split(term, ":") |> List.last()
      date = Timex.parse!(date_string, "{0M}/{D}/{YYYY}")

      from(
        m in query,
        where: m.inserted_at < ^date
      )
    end)
  end

  def apply_date_after_terms(query, []), do: query

  def apply_date_after_terms(query, date_after_terms) do
    Enum.reduce(date_after_terms, query, fn term, query ->
      date_string = String.split(term, ":") |> List.last()
      date = Timex.parse!(date_string, "{0M}/{D}/{YYYY}")

      from(
        m in query,
        where: m.inserted_at > ^date
      )
    end)
  end

  def apply_date_on_terms(query, []), do: query

  def apply_date_on_terms(query, date_on_terms) do
    date_string = List.first(date_on_terms) |> String.split(":") |> List.last()
    date = Timex.parse!(date_string, "{0M}/{D}/{YYYY}")

    from(
      m in query,
      where: m.inserted_at >= ^Timex.beginning_of_day(date),
      where: m.inserted_at <= ^Timex.end_of_day(date)
    )
  end

  def apply_to_user_filters(query, []), do: query

  def apply_to_user_filters(query, to_users) do
    user_ids =
      Enum.map(to_users, fn user_string ->
        String.split(user_string, ":") |> List.last() |> String.to_integer()
      end)

    from(
      m in query,
      where: fragment("? @> ?::integer[]", m.mentioned_user_ids, ^user_ids)
    )
  end

  def apply_from_user_filters(query, []), do: query

  def apply_from_user_filters(query, from_users) do
    user_ids =
      Enum.map(from_users, fn user_string ->
        String.split(user_string, ":") |> List.last() |> String.to_integer()
      end)

    from(
      m in query,
      where: m.user_id in ^user_ids
    )
  end

  def apply_room_filters(query, []), do: query

  def apply_room_filters(query, room_terms) do
    group_ids =
      Enum.map(room_terms, fn room_string ->
        String.split(room_string, ":") |> List.last() |> String.to_integer()
      end)

    from(
      m in query,
      where: m.group_id in ^group_ids
    )
  end

  def apply_exact_search_terms(query, []), do: query

  def apply_exact_search_terms(query, exact_search_terms) do
    Enum.reduce(exact_search_terms, query, fn term, query ->
      term =
        term
        |> String.replace_prefix("\"", "")
        |> String.replace_suffix("\"", "")

      from(
        m in query,
        or_where: like(m.text_content, ^"%#{String.replace(term, "%", "\\%")}%")
      )
    end)
  end

  def apply_search_terms(query, []), do: query

  def apply_search_terms(query, search_terms) do
    term = Enum.join(search_terms, " | ")

    from(
      m in query,
      where: fragment("? %> ?", m.text_content, ^term),
      order_by: [desc: :inserted_at, asc: fragment("? <->> ?", m.text_content, ^term)]
    )
  end

  def from_users_groups(user_id, opts) do
    user_groups_ids =
      GroupUser
      |> where([gu], gu.user_id == ^user_id)
      |> select([gu], gu.group_id)
      |> Repo.all()

    limit = Enum.min([Keyword.get(opts, :limit, 30), 1000])

    from(
      m in Message,
      where: m.group_id in ^user_groups_ids,
      where: m.type != ^"system",
      limit: ^limit
    )
  end

  def parameterize(term_string) do
    parts = term_string |> String.trim() |> String.split(" ")

    params = %{
      search_terms: [],
      exact_search_terms: [],
      wildcard_terms: [],
      minus_terms: [],
      room_terms: [],
      messages_to_terms: [],
      messages_from_terms: [],
      date_before_terms: [],
      date_after_terms: [],
      date_on_terms: [],
      date_during_terms: []
    }

    Enum.reduce(parts, params, fn p, params ->
      cond do
        String.starts_with?(p, "\"") && String.ends_with?(p, "\"") ->
          Map.update!(params, :exact_search_terms, fn ps -> [p | ps] end)

        String.ends_with?(p, "*") ->
          Map.update!(params, :wildcard_terms, fn ps -> [p | ps] end)

        String.starts_with?(p, "-") ->
          Map.update!(params, :minus_terms, fn ps -> [p | ps] end)

        String.starts_with?(p, "in:") ->
          Map.update!(params, :room_terms, fn ps -> [p | ps] end)

        String.starts_with?(p, "to:") ->
          Map.update!(params, :messages_to_terms, fn ps -> [p | ps] end)

        String.starts_with?(p, "from:") ->
          Map.update!(params, :messages_from_terms, fn ps -> [p | ps] end)

        String.starts_with?(p, "before:") ->
          Map.update!(params, :date_before_terms, fn ps -> [p | ps] end)

        String.starts_with?(p, "after:") ->
          Map.update!(params, :date_after_terms, fn ps -> [p | ps] end)

        String.starts_with?(p, "on:") ->
          Map.update!(params, :date_on_terms, fn ps -> [p | ps] end)

        String.starts_with?(p, "during:") ->
          Map.update!(params, :date_during_terms, fn ps -> [p | ps] end)

        true ->
          Map.update!(params, :search_terms, fn ps -> [p | ps] end)
      end
    end)
  end
end
