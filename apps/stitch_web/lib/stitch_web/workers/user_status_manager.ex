defmodule Stitch.UserStatusManager do
  @moduledoc """
  Worker for removing expired user statuses.
  """

  use GenServer
  alias Stitch.Accounts.UserStatus

  use Appsignal.Instrumentation.Decorators

  # 60 seconds
  @clean_interval 60

  def start_link do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def init(state) do
    schedule_cleanup()
    {:ok, state}
  end

  def handle_info(:clean, state) do
    schedule_cleanup()
    clean_stale()
    {:noreply, state}
  end

  @decorate transaction(:background_job)
  def clean_stale do
    UserStatus.clear_expired_status()
  end

  defp schedule_cleanup do
    Process.send_after(self(), :clean, @clean_interval * 1000)
  end
end
