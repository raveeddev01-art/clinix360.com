# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :stitch_connect,
  namespace: StitchConnect

# Configures the endpoint
config :stitch_connect, StitchConnect.Web.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "rp9jtclD/mgOBBlbo+mFKHVZ0UKNdC6DoofvmAy0Z/gSmgPy0/73DhzLrDalDf/G",
  render_errors: [view: StitchConnect.Web.ErrorView, accepts: ~w(html json)],
  pubsub: [name: StitchConnect.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configure application environment.
config :stitch_connect, env: Mix.env

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"

# Guardian configuration.
config :guardian, Guardian,
  allowed_algos: ["HS512"],
  verify_module: Guardian.JWT,
  issuer: "StitchConnect",
  ttl: { 30, :days },
  allowed_drift: 2000,
  verify_issuer: true, # optional
  secret_key: "daUyE9JOpu2Wqj4XGJ8Z7Gj/BHtQi+jWyRDtk31HWtdYu4FTUE7aimyONoeGIIBQ",
  serializer: StitchConnect.GuardianSerializer
