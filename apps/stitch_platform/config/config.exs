# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :stitch_platform,
  namespace: StitchPlatform

# Configures the endpoint
config :stitch_platform, StitchPlatformWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "3ViONcb+heg3zaF0FG28QGA8BRXewWGJNg7e7ZQzmCM7jC85odYsprkjS1orckSF",
  render_errors: [view: StitchPlatformWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: StitchPlatform.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
