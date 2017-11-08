defmodule Stitch.Analytics.Supervisor do
  @moduledoc false

  use Supervisor

  def start_link() do
    Supervisor.start_link(__MODULE__, nil)
  end

  def init(_) do
    children = [
      supervisor(Task.Supervisor, [[name: Stitch.Analytics.Sync.Supervisor]]),
      worker(Stitch.Analytics.Sync.RecurringSync, [])
    ]

    supervise(children, strategy: :one_for_one)
  end
end
