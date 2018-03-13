defmodule Stitch.Application do
  @moduledoc false

  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    children = [
      supervisor(Stitch.Repo, []),
      supervisor(Task.Supervisor, [[name: Stitch.Exports.Supervisor]]),
      supervisor(Stitch.Analytics.Supervisor, []),
      supervisor(Stitch.Redix.Supervisor, []),
    ]

    opts = [strategy: :one_for_one, name: Stitch.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
