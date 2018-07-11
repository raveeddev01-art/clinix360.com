defmodule StitchConnect.ActivityTrackerWorker do
  @moduledoc """
  Worker for removing outdated records from activity tracking sets.
  """

  use GenServer

  alias Stitch.{
    Accounts.ActivityTracker,
    Accounts.User,
    UserQueries
  }

  alias StitchConnect.Web.PushNotifications

  use Appsignal.Instrumentation.Decorators

  # 60 seconds
  @clean_interval 60

  def start_link do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
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
    ActivityTracker.clean_stale(fn
      _user_id, [] ->
        nil

      user_id, message_ids ->
        with %User{} = user <- UserQueries.get_by_id(user_id) do
          PushNotifications.notify_user(user, message_ids)
        else
          _ -> nil
        end
    end)
  end

  defp schedule_cleanup do
    Process.send_after(self(), :clean, @clean_interval * 1000)
  end
end
