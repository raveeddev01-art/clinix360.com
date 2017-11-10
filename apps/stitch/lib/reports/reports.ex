defmodule Stitch.Reports do
  @moduledoc """
  This module defines functions for aggregating data for in-app analytics
  reports.

  """

  alias Stitch.Team
  alias Stitch.Reports.MessagesSent

  @typedoc "Supported time periods"
  @type time_period :: :last_7_days | :last_30_days | :all_time

  @typedoc "Supported options"
  @type option :: {:time_period, time_period} | {:start_at, Date.t} | {:end_at, Date.t}

  @doc """
  The 'messages sent' report contains a daily message count for a given team
  and time period.

  ## Example

      iex> messages_sent(%Team{...}, time_period: :last_30_days)
      %{"2017-01-01" => 3, "2017-01-02" => 0, ...}

  """
  @spec messages_sent(Team.t, [option]) :: map
  def messages_sent(%Team{} = team, opts) do
    MessagesSent.build(team, opts)
  end
end
