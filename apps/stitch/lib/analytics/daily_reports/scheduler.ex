defmodule Stitch.Analytics.DailyReports.Scheduler do
  @moduledoc """
  Triggers the creation of daily reports. As the name implies these should run
  daily.

  Daily reports are a collection of user and group (team) traits that have to
  be calculated and pushed to our remote analytics tool (Segment) on a daily
  basis.

  """

  use GenServer
  alias Stitch.Analytics.DailyReports

  @name {:global, __MODULE__}

  # Client

  def start_link do
    case GenServer.start_link(__MODULE__, nil, name: @name) do
      {:ok, pid} -> {:ok, pid}
      {:error, {:already_started, pid}} ->
        Process.link(pid)
        {:ok, pid}
      :ignore -> :ignore
    end
  end

  # Server (callbacks)

  def init(_) do
    if enabled?() do
      schedule_next()
      {:ok, nil}
    else
      :ignore
    end
  end

  def handle_info(:create, state) do
    today = Date.utc_today()
    if state != today do
      DailyReports.create()
      schedule_next()
      {:noreply, today}
    else
      schedule_next()
      {:noreply, state}
    end
  end

  defp schedule_next do
    Process.send_after(self(), :create, 300_000) # In 5 minutes
  end

  defp enabled? do
    Application.get_env(:stitch, __MODULE__)[:enabled]
  end
end
