defmodule Stitch.Analytics.CohortAnalysisTeams do
  import Ecto.Query

  def at_least_one_message(date, team_ids, _messages_threshold) do
    months = Timex.diff(NaiveDateTime.utc_now(), date, :months)

    query = """
      with series as (
        SELECT date_trunc('month', t.date) date
        FROM generate_series('now'::timestamp - $2::interval, 'now'::timestamp, '1 month'::interval) t
      ), wteams as (
        SELECT date_trunc('month', a.date) date, team_id team_id, sum(count) message_count
        FROM analytics_message_counts a
        WHERE team_id = ANY($1)
        GROUP BY (date_trunc('month', a.date), team_id)
      ), fteams as (
        SELECT * FROM wteams w
        WHERE w.message_count >= 1
      ), gteams as (
        SELECT date_trunc('month', f.date)p date, count(team_id) c FROM fteams f
        GROUP BY date
      )
      SELECT * FROM series s LEFT OUTER JOIN gteams a ON s.date = a.date
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
      [_date, _count, team_ids] = row
      team_ids
    end)
  end

  def teams_info(opts) do
    team_ids =
      Stitch.Analytics.CohortAnalysisTeams.stat(opts)
      |> Enum.uniq()
      |> Enum.filter(&(&1 != nil))

    Stitch.Team
    |> where([t], t.id in ^team_ids)
    |> order_by([p], asc: p.inserted_at)
    |> select([t], %{name: t.name, inserted_at: t.inserted_at})
    |> Stitch.Repo.all()
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
