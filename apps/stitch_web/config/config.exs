# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :stitch_web,
  namespace: StitchConnect,
  ecto_repos: [Stitch.Repo]

# Configures the endpoint
config :stitch_web, Stitch.Web.Endpoint,
  instrumenters: [Appsignal.Phoenix.Instrumenter],
  url: [host: System.get_env("APP_HOST")],
  secret_key_base: "rp9jtclD/mgOBBlbo+mFKHVZ0UKNdC6DoofvmAy0Z/gSmgPy0/73DhzLrDalDf/G",
  render_errors: [view: Stitch.Web.ErrorView, accepts: ~w(html json)],
  pubsub: [name: StitchConnect.PubSub, adapter: Phoenix.PubSub.PG2]

# Configure AppSignal Template Instrumentation
config :phoenix, :template_engines,
  eex: Appsignal.Phoenix.Template.EExEngine,
  exs: Appsignal.Phoenix.Template.ExsEngine

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :stitch_web, :generators, context_app: :stitch

# Configure application environment
config :stitch_web,
  env: Mix.env(),
  application_host: "#{System.get_env("APP_HOST")}#{if Mix.env() == :dev, do: ":4001"}",
  application_scheme: "https://",
  websocket_scheme: "wss://",
  apns_topic: System.get_env("APNS_TOPIC"),
  apns_engage_topic: System.get_env("ENGAGE_APNS_TOPIC")

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"

# Guardian configuration. (TODO: Move to parent)
config :guardian, Guardian,
  allowed_algos: ["HS512"],
  verify_module: Guardian.JWT,
  issuer: "StitchConnect",
  ttl: {30, :days},
  allowed_drift: 2000,
  # optional
  verify_issuer: true,
  secret_key: "daUyE9JOpu2Wqj4XGJ8Z7Gj/BHtQi+jWyRDtk31HWtdYu4FTUE7aimyONoeGIIBQ",
  serializer: Stitch.Web.GuardianSerializer

config :phoenix, :filter_parameters, ["password", "pin"]

config :stitch_web, StitchConnect.MessageMailer,
  jobs: [
    # Every 15 minutes
    {"*/15 * * * *", {StitchConnect.MessageMailer, :deliver, ["15min"]}},

    # Every hour
    {"0 * * * *", {StitchConnect.MessageMailer, :deliver, ["hourly"]}},

    # Every midnight
    {"@daily", {StitchConnect.MessageMailer, :deliver, ["daily"]}}
  ],
  global: true,
  timeout: 10 * 60 * 1_000

# Push notifications configuration used by Pigeon.
config :pigeon,
  workers: [
    {Stitch.Pigeon, :apns_config},
    {Stitch.Pigeon, :fcm_config},
    {Stitch.Pigeon, :engage_apns_config}
  ]

config :stitch_web, :phoenix_swagger,
  swagger_files: %{
    "swagger.json" => [router: Stitch.Web.Router],
    "carespace-swagger.json" => [router: Stitch.Web.SubdomainRouter]
  }
