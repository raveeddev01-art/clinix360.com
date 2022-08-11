defmodule Stitch.Application do
  @moduledoc false

  use Application

  def start(_type, _) do
    children = [
      Stitch.ReadReplicaRepo,
      Stitch.Repo,
      Stitch.ElasticsearchCluster
    ]

    background_jobs = [
      {Task.Supervisor, name: Stitch.Exports.Supervisor},
      {Stitch.Redix, name: :redix},
      Stitch.Analytics.Supervisor
    ]

    children =
      if System.get_env("DISABLE_BACKGROUND_WORKERS") == "true" do
        children
      else
        children ++ background_jobs
      end

    opts = [strategy: :one_for_one, name: Stitch.Supervisor]
    Supervisor.start_link(children, opts)
    |> IO.inspect(label: "applications started")
    # require IEx; IEx.pry()
  end
end
