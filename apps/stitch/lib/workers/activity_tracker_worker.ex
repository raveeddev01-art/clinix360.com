defmodule Stitch.ActivityTrackerWorker do
  @moduledoc """
  Worker for removing outdated records from activity tracking sets.
  """

  use GenServer

  alias Stitch.Accounts.ActivityTracker

  # 10 minutes
  @clean_interval 10 * 60

  def start_link do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def init(state) do
    schedule_cleanup()
    {:ok, state}
  end

  def handle_info(:clean, state) do
    schedule_cleanup()
    ActivityTracker.clean_stale()
    {:noreply, state}
  end

  defp schedule_work do
    Process.send_after(self(), :clean, @clean_interval * 1000)
  end
end
