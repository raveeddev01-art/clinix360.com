defmodule Stitch.Analytics.CohortAnalysisForUsers do
  def at_least_one_message(date, team_ids, messages_threshold) do
    months = Timex.diff(NaiveDateTime.utc_now(), date, :months)

    query = """
      with series as (
        SELECT date_trunc('month', t.date) date
        FROM generate_series('now'::timestamp - $2::interval, 'now'::timestamp, '1 month'::interval) t
      ), analytics_user_counts as (
        SELECT date_trunc('month', a.inserted_at) date, team_id team_id, count(id) message_count_1
        FROM users a
        WHERE team_id = ANY($1)
        GROUP BY (date_trunc('month', a.inserted_at), team_id)
      ), wteams as (
        SELECT date_trunc('month', a.date) date, team_id team_id, sum(count) message_count
        FROM analytics_message_counts a        WHERE team_id = ANY($1)
        GROUP BY (date_trunc('month', a.date), team_id)
      ), fteams as (
        SELECT * FROM wteams w
        WHERE w.message_count >= 1
      ), gteams as (
        SELECT date_trunc('month', f.date) date, count(team_id) c FROM fteams f
        GROUP BY date
        ORDER BY date
      ), dteams as (
        select date, c, round(100.0 * c / lag(c) over (order by date), 1) as delta from gteams
      ) SELECT * FROM series s LEFT OUTER JOIN gteams a ON s.date = a.date
    """

    res =
      Ecto.Adapters.SQL.query!(Stitch.Repo, query, [
        team_ids,
        %Postgrex.Interval{months: months + 1}
        # messages_threshold
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
      [date, count, team_ids] = row
      d = at_least_one_message(date, team_ids, messages_threshold)

      e = %{
        "Sign Up Month" => parse_date(date),
        "New Teams" => count,
        "date_source" => get_datetime(date)
      }

      d.rows
      |> Enum.with_index()
      |> Enum.map(fn {row, index} ->
        d = List.last(row)

        d =
          if d == nil do
            0
          else
            d
          end

        Map.merge(e, %{"period_age" => index, "retention_rate" => d})
      end)
    end)
    # |> Enum.filter(fn e -> e["retention_rate"] != nil end)
    |> Enum.sort_by(fn d -> date_for_sort(d["date_source"]) end)
    |> Poison.encode!()
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
    s
    |> DateTime.to_unix()
  end
end
