defmodule Stitch.Analytics.SnapshotQueries do
  @moduledoc """
  Queries used for Team Snapshot analytics
  """

  # import Ecto.Query

  alias Stitch.MessageQueries

  def active_users(_period, _team) do
    # union(DailyMessages, DailyReadsOrSessions)
    # inner_join users on user_id
    # count uniq_users

    17
  end

  def daily_files_uploaded(team) do
    MessageQueries.count(team, %{time_periot: :last_day})
  end

  def daily_messages_sent(team) do
    MessageQueries.count(team, %{time_periot: :last_day})
  end

  def daily_reads(_team) do
    # Count of read events
    8
  end

  def daily_sessions(_team) do
    # Count of session events
    10
  end
end
