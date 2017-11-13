defmodule Stitch.Reports.MessagesSent do
  @moduledoc """
  This module defines functions for building 'messages sent' reports.

  The 'messages sent' report contains a daily message count for a given team
  and time period.

  """

  import Ecto.Query
  alias Stitch.{Reports, Repo, Team, Message}

  @typedoc "Supported message types"
  @type message_type :: :chat | :upload

  @typedoc "Supported options"
  @type option :: {:time_period, Reports.time_period}
                  | {:type, message_type}
                  | {:start_at, Date.t}
                  | {:end_at, Date.t}

  @doc """
  Builds a messages sent report.

  ## Example

      iex> messages_sent(%Team{...}, type: :upload, time_period: :last_30_days)
      %{"2017-01-01" => 3, "2017-01-02" => 0, ...}

  """
  @spec build(Team.t, [option]) :: map
  def build(%Team{} = team, [type: type, start_at: start_at, end_at: end_at]) do
    team
    |> messages_sent_grouped_by_date(type, start_at, end_at)
    |> Map.new()
    |> fill_in_missing_dates(start_at, end_at)
  end
  def build(%Team{} = team, [type: type, time_period: :all_time, end_at: end_at]) do
    start_at = NaiveDateTime.to_date(team.inserted_at)
    build(team, type: type, start_at: start_at, end_at: end_at)
  end
  def build(%Team{} = team, [type: type, time_period: time_period, end_at: end_at]) do
    start_at = Date.add(end_at, day_diff(time_period))
    build(team, type: type, start_at: start_at, end_at: end_at)
  end
  def build(%Team{} = team, [time_period: time_period, type: type]) do
    today = Date.utc_today()
    two_days_ago = Date.add(today, -2)
    build(team, type: type, time_period: time_period, end_at: two_days_ago)
  end
  def build(%Team{} = team, [time_period: time_period, end_at: end_at]) do
    build(team, type: :chat, time_period: time_period, end_at: end_at)
  end
  def build(%Team{} = team, [time_period: time_period]) do
    build(team, time_period: time_period, type: :chat)
  end

  defp day_diff(time_period) do
    Map.get(%{last_30_days: -29, last_7_days: -6}, time_period, -29)
  end

  defp messages_sent_grouped_by_date(team, type, start_at, end_at) do
    {:ok, start_at_datetime} = NaiveDateTime.new(start_at, ~T[00:00:00])
    {:ok, end_at_datetime} = NaiveDateTime.new(end_at, ~T[23:59:59.999999])

    query =
      from m in Message,
      join: g in assoc(m, :group),
      where: g.team_id == ^team.id,
      where: m.inserted_at >= ^start_at_datetime,
      where: m.inserted_at <= ^end_at_datetime,
      where: m.type == ^Atom.to_string(type),
      group_by: fragment("to_char(?, ?)", m.inserted_at, "YYYY-MM-DD"),
      select: {fragment("to_char(?, ?)", m.inserted_at, "YYYY-MM-DD"), count(m.id)}
    Repo.all(query)
  end

  defp fill_in_missing_dates(query_results, start_at, end_at) do
    start_at
    |> Date.range(end_at)
    |> Map.new(&({Date.to_iso8601(&1), 0}))
    |> Map.merge(query_results)
  end

end
