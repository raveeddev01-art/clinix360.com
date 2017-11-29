defmodule Stitch.Analytics.Supervisor do
  @moduledoc false

  use Supervisor

  def start_link() do
    Supervisor.start_link(__MODULE__, nil)
  end

  def init(_) do
    children = [
      supervisor(Task.Supervisor, [[name: Stitch.Analytics.Sync.Supervisor]], id: make_ref()),
      supervisor(Task.Supervisor, [[name: Stitch.Analytics.DailyReports.Supervisor]], id: make_ref()),
      worker(Stitch.Analytics.Sync.RecurringSync, []),
      worker(Stitch.Analytics.DailyReports.Scheduler, [])
    ]

    supervise(children, strategy: :one_for_one)
  end
end
