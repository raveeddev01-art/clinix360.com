use Mix.Config

config :stitch, Stitch.Repo,
  adapter: Ecto.Adapters.Postgres,
  password: System.get_env("STITCH_POSTGRES_PASSWORD"),
  database: "stitch_dev"

config :stitch, Stitch.Mailer,
  adapter: Bamboo.MandrillAdapter,
  api_key: System.get_env("MANDRILL_API_KEY")

config :stitch, Stitch.Exports,
  enabled: true

config :stitch,
  stripe_client: Stitch.Stripe.Client,
  segment_api: Stitch.Analytics.Segment.InMemory,
  analytics: Stitch.Analytics

config :stitch, Stitch.Analytics.Sync.RecurringSync,
  enabled: false
