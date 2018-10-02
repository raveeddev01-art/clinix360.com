defmodule Stitch.Analytics.CohortAnalysisForUsers do
  def users_count_per_month(date, team_ids) do
    months = Timex.diff(NaiveDateTime.utc_now(), date, :months)

    query = """
      with series as (
        SELECT
          date_trunc('month', t.date) date
        FROM generate_series('now'::timestamp - $2::interval, 'now'::timestamp, '1 month'::interval) t
      ), user_count_per_month as (
        SELECT
          date_trunc('month', a.inserted_at) date,
          count(id) user_count
        FROM users a
        WHERE team_id = ANY($1)
        GROUP BY (date_trunc('month', a.inserted_at))
      ), result as (
        SELECT
          s.date date,
          a.user_count user_count
        FROM series s
        LEFT OUTER JOIN user_count_per_month a ON s.date = a.date
        ORDER BY s.date
      ) SELECT
        a.date date,
        user_count
      FROM result a
    """

    Ecto.Adapters.SQL.query!(Stitch.Repo, query, [
      team_ids,
      %Postgrex.Interval{months: months + 1}
    ])
  end

  def stat(opts) do
    messages_threshold = opts[:messages_threshold] || 1

    query = """
      with
      team_with_message_count as (
        select
          sum(a.count) count,
          team_id
        from analytics_message_counts a
        group by a.team_id
      ),
      team_ids_with_100_messages as (
        select * from team_with_message_count t
        where t.count > $1
      ),
      teams_with_100_messages as (
        select * from team_ids_with_100_messages t
        inner join teams t2 on t2.id = t.team_id
      ),
      series as (
        SELECT date_trunc('month', t) date
        FROM generate_series('now'::timestamp - '11 months'::interval, 'now'::timestamp,  '1 month'::interval) t
      ), maintable as (
        select s.date, count(t.id), array_agg(t.id)
        from series s left outer join teams_with_100_messages t on date_trunc('month', t.inserted_at) = s.date
        group by date
      )
      select * from maintable
      order by date;
    """

    res = Ecto.Adapters.SQL.query!(Stitch.Repo, query, [messages_threshold])

    Enum.flat_map(res.rows, fn row ->
      [date, team_count, team_ids] = row
      line = users_count_per_month(date, team_ids)

      e = %{
        "Sign Up Month" => parse_date(date),
        "New Teams" => team_count,
        "date_source" => get_datetime(date)
      }

      rows = line.rows

      rows
      |> Enum.with_index()
      |> Enum.map(fn {r, index} ->
        currrent_count = r |> List.last()

        delta =
          if index < 0 do
            currrent_count * 100.0
          else
            previous_count = rows |> Enum.at(index - 1) |> List.last()

            if previous_count == nil or previous_count == 0 do
              if currrent_count == nil or currrent_count == 0 do
                0
              else
                currrent_count * 100.0
              end
            else
              if currrent_count == nil or currrent_count == 0 do
                -100.0
              else
                currrent_count / previous_count * 100.0
              end
            end
          end

        Map.merge(e, %{"period_age" => index, "retention_rate" => delta})
      end)
      |> Enum.sort_by(fn d -> date_for_sort(d["date_source"]) end)
    end)
  end

  def parse_date(d) do
    d |> Timex.format!("%Y %b", :strftime)
  end

  def get_datetime(s) do
    {{y, m, d}, _} = s
    s = {{y, m, d}, {0, 0, 0}}

    s
    |> NaiveDateTime.from_erl!()
    |> DateTime.from_naive!("Etc/UTC")
  end

  def date_for_sort(s) do
    DateTime.to_unix(s)
  end
end
