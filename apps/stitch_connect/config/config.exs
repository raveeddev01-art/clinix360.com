# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :stitch_connect,
  namespace: StitchConnect,
  ecto_repos: [Stitch.Repo]

# Configures the endpoint
config :stitch_connect, StitchConnect.Web.Endpoint,
  instrumenters: [Appsignal.Phoenix.Instrumenter],
  url: [host: System.get_env("APP_HOST")],
  secret_key_base: "rp9jtclD/mgOBBlbo+mFKHVZ0UKNdC6DoofvmAy0Z/gSmgPy0/73DhzLrDalDf/G",
  render_errors: [view: StitchConnect.Web.ErrorView, accepts: ~w(html json)],
  pubsub: [name: StitchConnect.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configure AppSignal Template Instrumentation
config :phoenix, :template_engines,
  eex: Appsignal.Phoenix.Template.EExEngine,
  exs: Appsignal.Phoenix.Template.ExsEngine

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :stitch_connect, :generators,
  context_app: :stitch

# Configure application environment
config :stitch_connect,
  env: Mix.env,
  application_host: "#{System.get_env("APP_HOST")}#{if Mix.env == :dev, do: ":4443"}",
  apns_topic: System.get_env("APNS_TOPIC")

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"

# Guardian configuration.
config :guardian, Guardian,
  allowed_algos: ["HS512"],
  verify_module: Guardian.JWT,
  issuer: "StitchConnect",
  ttl: {30, :days},
  allowed_drift: 2000,
  verify_issuer: true, # optional
  secret_key: "daUyE9JOpu2Wqj4XGJ8Z7Gj/BHtQi+jWyRDtk31HWtdYu4FTUE7aimyONoeGIIBQ",
  serializer: StitchConnect.GuardianSerializer

config :phoenix, :filter_parameters, ["password", "pin"]

config :stitch_connect, StitchConnect.Upload,
  access_key_id: System.get_env("AWS_ACCESS_KEY_ID"),
  secret_access_key: System.get_env("AWS_SECRET_ACCESS_KEY"),
  region: System.get_env("S3_REGION"),
  bucket: System.get_env("S3_BUCKET_NAME"),
  scheme: "https://",
  host: "s3.amazonaws.com"

config :stitch_connect, StitchConnect.MessageMailer,
  jobs: [
    # Every 15 minutes
    {"*/15 * * * *",   {StitchConnect.MessageMailer, :deliver, ["15min"]}},

    # Every hour
    {"0 * * * *",      {StitchConnect.MessageMailer, :deliver, ["hourly"]}},

    # Every midnight
    {"@daily",         {StitchConnect.MessageMailer, :deliver, ["daily"]}},
  ],
  global: true,
  timeout: 10 * 60 * 1_000

# Push notifications configuration used by Pigeon.
config :pigeon, workers: [
  {StitchConnect.Pigeon, :apns_config},
  {StitchConnect.Pigeon, :fcm_config}
]
