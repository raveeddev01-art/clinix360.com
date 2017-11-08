defmodule Stitch.Analytics.Sync.RecurringSync do
  @moduledoc """
  Schedules recurring analytics sync job.

  """

  use GenServer
  alias Stitch.Analytics.Sync

  @name {:global, __MODULE__}

  # Client

  def start_link() do
    case GenServer.start_link(__MODULE__, nil, name: @name) do
      {:ok, pid} ->
        {:ok, pid}
      {:error, {:already_started, pid}} ->
        Process.link(pid)
        {:ok, pid}
      :ignore ->
        :ignore
    end
  end

  # Server (callbacks)

  def init(_) do
    if enabled?() do
      schedule_initial_sync()
      {:ok, nil}
    else
      :ignore
    end
  end

  def handle_info(:perform, state) do
    Sync.perform()
    schedule_next_sync()
    {:noreply, state}
  end

  defp schedule_initial_sync() do
    Process.send_after(self(), :perform, 5_000) # In 5 seconds
  end

  defp schedule_next_sync() do
    Process.send_after(self(), :perform, 1_000) # In 1 second
  end

  defp enabled?() do
    Application.get_env(:stitch, __MODULE__)[:enabled]
  end
end
