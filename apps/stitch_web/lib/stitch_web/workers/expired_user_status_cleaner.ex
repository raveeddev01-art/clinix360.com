defmodule Stitch.ExpiredUserStatusCleaner do
  @moduledoc """
  Worker for removing expired user statuses.
  """

  use GenServer
  use Appsignal.Instrumentation.Decorators
  alias Stitch.Accounts.{UserStatus, User}
  alias Stitch.{Repo, Team}


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
    UserStatus.users_with_expired_status()
    |> Enum.uniq()
    |> Enum.map(fn user_id ->
      with {:ok, _} <- UserStatus.clear_user_status(user_id),
           %User{} = user <- Stitch.UserQueries.get_by_id(user_id),
           %Team{} = team <- Stitch.TeamQueries.get_by_id(user.team_id) do
        Stitch.Web.TeamChannel.broadcast_user_info(team, user)
      end
    end)
  end

  defp schedule_cleanup do
    Process.send_after(self(), :clean, @clean_interval * 1000)
  end
end
