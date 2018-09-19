defmodule Stitch.Web.Application do
  use Application

  def start(_type, _args) do
    import Supervisor.Spec

    # Define workers and child supervisors to be supervised
    children = [
      # Start the endpoint when the application starts
      supervisor(Stitch.Web.Endpoint, []),
      supervisor(Stitch.Web.Presence, [])
      # Start your own worker by calling: StitchConnect.Worker.start_link(arg1, arg2, arg3)
      # worker(StitchConnect.Worker, [arg1, arg2, arg3]),
    ]

    background_jobs = [
      worker(StitchConnect.MessageMailer, []),
      worker(Stitch.PresignedUrlCache, []),
      worker(StitchConnect.ActivityTrackerWorker, [])
    ]

    background_jobs =
      if Application.get_env(:stitch_web, :env) == :test do
        background_jobs
      else
        background_jobs ++
          [
            worker(StitchConnect.MobileBadgeUpdater, [])
          ]
      end

    children =
      if System.get_env("DISABLE_BACKGROUND_WORKERS") == "true" do
        children
      else
        children ++ background_jobs
      end

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [
      strategy: :one_for_one,
      name: StitchConnect.Supervisor,
      max_restarts: 1_000,
      max_seconds: 1
    ]

    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    Stitch.Web.Endpoint.config_change(changed, removed)
    :ok
  end
end
