# TODO: this will eventually replace messages_sent.ex
# wholesale. Easier to start based off of other file tho.

defmodule Stitch.Reports.MessagesSentByPlatform do
  @moduledoc """
  Queries active users for user analytics page.

  Currently using raw SQL to calculate active users on the fly,
  but will eventually look at team snapshots taken daily.
  """

  import Ecto.Query
  alias Stitch.{Repo, Team, Message}

  @typedoc "Supported options"
  @type option ::
          {:time_period, Reports.time_period()}
          | {:start_at, Date.t()}
          | {:end_at, Date.t()}

  @doc """
  Builds a active users report for a given team and options.

  Options are expected to be a keyword list, order matters.
  `time_period` option is required.
  """
  @spec build(Team.t(), [option]) :: [map]
  def build(%Team{} = team, time_period: time_period) do
    build(
      team,
      start_at: get_start_at(team, time_period),
      end_at: two_days_ago()
    )
  end

  def build(%Team{} = team, start_at: start_at, end_at: end_at) do
    Enum.map([true, false], fn is_mobile ->
      messages_sent_by_date_and_platform(is_mobile, team, start_at, end_at)
      |> Map.new()
      |> fill_in_missing_dates(start_at, end_at)
    end)
  end

  defp get_start_at(team, :all_time) do
    NaiveDateTime.to_date(team.inserted_at)
  end

  defp get_start_at(_team, time_period) do
    Date.add(
      two_days_ago(),
      day_diff(time_period)
    )
  end

  defp two_days_ago do
    today = Date.utc_today()
    Date.add(today, -2)
  end

  defp day_diff(time_period) do
    Map.get(
      %{
        last_30_days: -29,
        last_7_days: -6
      },
      time_period,
      -29
    )
  end

  defp messages_sent_by_date_and_platform(is_mobile, team, start_at, end_at) do
    {:ok, start_at_datetime} = NaiveDateTime.new(start_at, ~T[00:00:00])
    {:ok, end_at_datetime} = NaiveDateTime.new(end_at, ~T[23:59:59.999999])

    query =
      from(
        m in Message,
        join: g in assoc(m, :group),
        where: g.team_id == ^team.id,
        where: m.inserted_at >= ^start_at_datetime,
        where: m.inserted_at <= ^end_at_datetime,
        where: fragment("coalesce(?, false) = ?", m.client_is_mobile, ^is_mobile),
        group_by: fragment("to_char(?, ?)", m.inserted_at, "YYYY-MM-DD"),
        select: {fragment("to_char(?, ?)", m.inserted_at, "YYYY-MM-DD"), count(m.id)}
      )

    Repo.all(query)
  end

  defp fill_in_missing_dates(query_results, start_at, end_at) do
    start_at
    |> Date.range(end_at)
    |> Map.new(&{Date.to_iso8601(&1), 0})
    |> Map.merge(query_results)
  end
end
