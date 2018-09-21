defmodule Stitch.Application do
  @moduledoc false

  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    children = [
      supervisor(Stitch.Repo, []),
      supervisor(Stitch.ElasticsearchCluster, [])
    ]

    background_jobs = [
      supervisor(Task.Supervisor, [[name: Stitch.Exports.Supervisor]]),
      supervisor(Stitch.Analytics.Supervisor, []),
      supervisor(Stitch.Redix.Supervisor, [])
    ]

    children =
      if System.get_env("DISABLE_BACKGROUND_WORKERS") == "true" do
        children
      else
        children ++ background_jobs
      end

    opts = [strategy: :one_for_one, name: Stitch.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
