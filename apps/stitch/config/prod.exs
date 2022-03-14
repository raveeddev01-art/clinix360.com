use Mix.Config

repo_opts = [
  adapter: Ecto.Adapters.Postgres,
  port: String.to_integer(System.get_env("STITCH_CONNECT_POSTGRES_PORT") || "5432"),
  hostname: System.get_env("STITCH_CONNECT_POSTGRES_HOSTNAME") || "localhost",
  username: System.get_env("STITCH_CONNECT_POSTGRES_USERNAME") || "postgres",
  password: System.get_env("STITCH_CONNECT_POSTGRES_PASSWORD") || "postgres",
  database: System.get_env("STITCH_CONNECT_POSTGRES_DATABASE") || "stitch_connect_dev",
  pool_size: String.to_integer(System.get_env("STITCH_CONNECT_POSTGRES_POOL_SIZE") || "10"),
  ssl: false,
  log: true,
  loggers: [Ecto.LogEntry]
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
  segment_api: Stitch.Analytics.Segment.HTTPClient,
  analytics: Stitch.Analytics

config :stitch, Stitch.Analytics.Sync.RecurringSync, enabled: true

config :stitch, Stitch.Analytics.DailyReports.Scheduler, enabled: true

config :pdf_generator, command_prefix: ["xvfb-run", "-a"]
