defmodule Stitch.Analytics.CohortAnalysisForUsers do
  import Ecto.Query

  alias Stitch.{Repo}

  # 14 - 11
  def users_count_per_month(date, team_ids) do
    months = Timex.diff(NaiveDateTime.utc_now(), date, :months)

    query = """
      with series as (
        SELECT
          date_trunc('month', t.date) date
        FROM generate_series('now'::timestamp - $2::interval, 'now'::timestamp, '1 month'::interval) t
      ), user_count_per_month as (
        SELECT
          date_trunc('month', u.inserted_at) date,
          count(id) user_count
        FROM users u
        WHERE team_id = ANY($1)
        GROUP BY (date_trunc('month', u.inserted_at))
      ), result as (
        SELECT
          s.date date,
          a.user_count user_count
        FROM series s
        LEFT OUTER JOIN user_count_per_month a ON s.date = a.date
        ORDER BY s.date
      ), user_count_by_month as (
        SELECT count(u.id) c, date_trunc('month', u.inserted_at) date
        FROM users u
        WHERE u.team_id = ANY($1)
          AND date_trunc('month', u.inserted_at) = date_trunc('month', $3::timestamp)
        GROUP BY date_trunc('month', u.inserted_at)
      ) SELECT
        a.date date,
        a.user_count::float
      FROM result a
    """

    Ecto.Adapters.SQL.query!(Stitch.Repo, query, [
      team_ids,
      %Postgrex.Interval{months: months + 1},
      date
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
        FROM generate_series('now'::timestamp - '14 months'::interval, 'now'::timestamp,  '1 month'::interval) t
      ), maintable as (
        SELECT s.date, count(t.id), array_agg(t.id)
        FROM series s
        LEFT OUTER JOIN teams_with_100_messages t ON date_trunc('month', t.inserted_at) = s.date
        GROUP BY date
      )
      SELECT * FROM maintable
      ORDER BY date
    """

    res = Ecto.Adapters.SQL.query!(Stitch.Repo, query, [messages_threshold])

    Enum.flat_map(res.rows, fn row ->
      [date, team_count, team_ids] = row
      line = users_count_per_month(date, team_ids)
      get_user_count = get_user_count(date, team_ids) || 1

      # IO.inspect(["user-count", get_user_count])

      e = %{
        "Sign Up Month" => parse_date(date),
        "New Teams" => team_count,
        "date_source" => get_datetime(date)
      }

      rows = line.rows

      rows
      |> Enum.with_index()
      |> Enum.map(fn {row, index} ->
        count = row |> List.last()

        Map.merge(e, %{"period_age" => index, "retention_rate" => count / get_user_count})
      end)
      |> Enum.sort_by(fn d -> date_for_sort(d["date_source"]) end)
    end)
  end

  def get_user_count(date, team_ids) do
    Stitch.Accounts.User
    |> where([u], u.team_id in ^team_ids)
    |> where(
      [u],
      fragment("date_trunc('month', ?) = date_trunc('month', ?::timestamp)", u.inserted_at, ^date)
    )
    |> select([u], count(u.id))
    |> Stitch.Repo.one()
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
