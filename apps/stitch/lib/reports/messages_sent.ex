defmodule Stitch.Reports.MessagesSent do
  @moduledoc """
  This module defines functions for building 'messages sent' reports.

  The 'messages sent' report contains a daily message count for a given team
  and time period.
  """

  import Ecto.Query
  alias Stitch.{Reports, Repo, Team, Message}

  @doc """
  Builds a messages sent report.

  ## Example

      iex> messages_sent(%Team{...}, time_period: :last_30_days)
      %{"2017-01-01" => 3, "2017-01-02" => 0, ...}

  """
  @spec build(Team.t, [Reports.option]) :: map
  def build(%Team{} = team, [time_period: :all_time, end_at: end_at]) do
    start_at = NaiveDateTime.to_date(team.inserted_at)
    build(team, start_at: start_at, end_at: end_at)
  end
  def build(%Team{} = team, [time_period: time_period, end_at: end_at]) do
    start_at = Date.add(end_at, day_diff(time_period))
    build(team, start_at: start_at, end_at: end_at)
  end
  def build(%Team{} = team, [time_period: time_period]) do
    today = Date.utc_today()
    two_days_ago = Date.add(today, -2)
    build(team, time_period: time_period, end_at: two_days_ago)
  end
  def build(%Team{} = team, [start_at: start_at, end_at: end_at]) do
    team
    |> messages_sent_grouped_by_date(start_at, end_at)
    |> Repo.all()
    |> Map.new()
    |> fill_in_missing_dates(start_at, end_at)
  end

  defp day_diff(time_period) do
    Map.get(%{last_30_days: -29, last_7_days: -6}, time_period, 29)
  end

  defp messages_sent_grouped_by_date(team, start_at, end_at) do
    {:ok, start_at_datetime} = NaiveDateTime.new(start_at, ~T[00:00:00])
    {:ok, end_at_datetime} = NaiveDateTime.new(end_at, ~T[23:59:59.999999])

    from m in Message,
    left_join: g in assoc(m, :group),
    where: g.team_id == ^team.id,
    where: m.inserted_at >= ^start_at_datetime,
    where: m.inserted_at <= ^end_at_datetime,
    group_by: fragment("to_char(?, ?)", m.inserted_at, "YYYY-MM-DD"),
    select: {fragment("to_char(?, ?)", m.inserted_at, "YYYY-MM-DD"), count(m.id)}
  end

  defp fill_in_missing_dates(query_results, start_at, end_at) do
    start_at
    |> Date.range(end_at)
    |> Map.new(&({Date.to_iso8601(&1), 0}))
    |> Map.merge(query_results)
  end

end
