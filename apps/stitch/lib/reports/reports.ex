defmodule Stitch.Reports do
  @moduledoc """
  This module defines functions for aggregating data for in-app analytics
  reports.

  """

  alias Stitch.{Reports, Team}
  alias Stitch.Reports.MessagesSent

  @typedoc "Supported report types"
  @type report_type :: :messages_sent | :files_uploaded

  @typedoc "Supported time periods"
  @type time_period :: :last_7_days | :last_30_days | :all_time

  @typedoc "Supported options"
  @type option ::  {:type, report_type} | {:time_period, time_period}

  @doc """
  Creates a report for a given team and options.

  ## Example

      iex> create(%Team{...}, type: :messages_sent, time_period: :last_30_days)
      %{type: :messages_sent,
        time_period: :last_30_days,
        body: %{"2017-01-01" => 3, "2017-01-02" => 0, ...}

  """
  @spec create(Team.t, [option]) :: map
  def create(%Team{} = team, opts) do
    body = apply(Reports, opts.type, [team, [time_period: opts.time_period]])
    %{type: opts.type, time_period: opts.time_period, body: body}
  end

  @doc """
  The 'messages sent' report contains a daily message count for a given team
  and time period. This report is for messages of type "chat".

  ## Example

      iex> messages_sent(%Team{...}, time_period: :last_30_days)
      %{"2017-01-01" => 3, "2017-01-02" => 0, ...}

  """
  @spec messages_sent(Team.t, [time_period]) :: map
  def messages_sent(%Team{} = team, opts) do
    MessagesSent.build(team, opts)
  end

  @doc """
  The 'files uploaded' report contains a daily file count for a given team
  and time period. This report is for messages of type "upload".

  ## Example

      iex> files_uploaded(%Team{...}, time_period: :last_30_days)
      %{"2017-01-01" => 3, "2017-01-02" => 0, ...}

  """
  @spec files_uploaded(Team.t, [time_period]) :: map
  def files_uploaded(%Team{} = team, opts) do
    opts_with_upload_type = Keyword.merge(opts, [type: :upload])
    MessagesSent.build(team, opts_with_upload_type)
  end
end
