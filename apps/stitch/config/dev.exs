use Mix.Config

repo_opts = [
  adapter: Ecto.Adapters.Postgres,
  password: System.get_env("STITCH_POSTGRES_PASSWORD"),
  database: System.get_env("STITCH_CONNECT_POSTGRES_DATABASE") || "stitch_dev",
  log: false
  # loggers: [Appsignal.Ecto, Ecto.LogEntry]
]

config :stitch, Stitch.Repo, repo_opts
config :stitch, Stitch.ReadReplicaRepo, repo_opts

config :stitch, Stitch.NewMailer,
  adapter: Bamboo.MailgunAdapter,
  api_key: System.get_env("MAILGUN_KEY"),
  domain: System.get_env("MAILGUN_DOMAIN")

config :stitch, Stitch.Exports, enabled: true

config :stitch,
  stripe_client: Stitch.Stripe.Client,
  segment_api: Stitch.Analytics.Segment.InMemory,
  analytics: Stitch.Analytics

config :stitch, Stitch.Analytics.Sync.RecurringSync, enabled: false

config :stitch, Stitch.Analytics.DailyReports.Scheduler, enabled: false

config :logger, level: :debug
