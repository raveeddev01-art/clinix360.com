defmodule Stitch.Analytics.CohortAnalysisForUsers do
  import Ecto.Query

  # alias Stitch.{Repo}

  def series(date) do
    months = Timex.diff(NaiveDateTime.utc_now(), date, :months)

    query = """
      SELECT
        date_trunc('month', t.date) date
      FROM generate_series('now'::timestamp - $1::interval, 'now'::timestamp, '1 month'::interval) t
    """

    result =
      Ecto.Adapters.SQL.query!(Stitch.Repo, query, [
        %Postgrex.Interval{months: months}
      ])

    Enum.map(result.rows, fn [row] ->
      from_erl(row)
    end)
  end

  def cast_int(x) do
    if x == nil or x == 0 do
      1
    else
      x
    end
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

      series(date)
      |> Enum.with_index()
      |> Enum.map(fn {sub_date, index} ->
        user_count = get_user_count(date, team_ids)
        user_subcount = get_user_subcount(sub_date, team_ids)

        e = %{
          "Sign Up Month" => parse_date(date),
          "New Teams" => team_count,
          "date_source" => get_datetime(date)
        }

        Map.merge(e, %{"period_age" => index, "retention_rate" => calc(user_subcount, user_count)})
      end)
      |> Enum.sort_by(fn d -> date_for_sort(d["date_source"]) end)
    end)
  end

  def calc(_x, 0) do
    0
  end

  def calc(_x, nil) do
    0
  end

  def calc(x, y) do
    x / y
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

  def get_user_subcount(date, team_ids) do
    Stitch.Accounts.User
    |> where([u], u.team_id in ^team_ids)
    |> where(
      [u],
      fragment("date_trunc('month', ?::timestamp) < ?", u.inserted_at, ^date)
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

  def from_erl(s) do
    {{y, m, d}, _} = s
    s = {{y, m, d}, {0, 0, 0}}

    s
    |> NaiveDateTime.from_erl!()
  end

  def date_for_sort(s) do
    DateTime.to_unix(s)
  end
end
