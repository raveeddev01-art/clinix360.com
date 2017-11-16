use Mix.Config

config :stitch, Stitch.Repo,
  adapter: Ecto.Adapters.Postgres,
  url: System.get_env("DATABASE_URL"),
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
  ssl: true,
  loggers: [Appsignal.Ecto, Ecto.LogEntry]

config :stitch, Stitch.Mailer,
  adapter: Bamboo.MandrillAdapter,
  api_key: System.get_env("MANDRILL_API_KEY")

config :stitch, Stitch.Exports,
  enabled: true

config :stitch,
  stripe_client: Stitch.Stripe.Client,
  segment_api: Stitch.Analytics.Segment.HTTPClient,
  analytics: Stitch.Analytics

config :stitch, Stitch.Analytics.Sync.RecurringSync,
  enabled: true
