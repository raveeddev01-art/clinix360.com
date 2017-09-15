defmodule Stitch.Application do
  @moduledoc false

  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    Supervisor.start_link([
      supervisor(Stitch.Repo, []),
      worker(Stitch.UnreadMessagesNotifier, []),
    ], strategy: :one_for_one, name: Stitch.Supervisor)
  end
end
