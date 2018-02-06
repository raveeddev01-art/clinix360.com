use Mix.Config

config :bcrypt_elixir, :log_rounds, 4

config :stitch, Stitch.Repo,
  adapter: Ecto.Adapters.Postgres,
  password: System.get_env("STITCH_POSTGRES_PASSWORD"),
  database: "stitch_test",
  hostname: "localhost",
  port: String.to_integer(System.get_env("PSQL_PORT") || "5432"),
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_timeout: :timer.minutes(5),
  timeout: :timer.minutes(5)

config :stitch, Stitch.Mailer,
  adapter: Bamboo.TestAdapter

config :stitch, Stitch.Exports,
  enabled: false

config :stitch,
  stripe_client: Stitch.Stripe.TestClient,
  segment_api: Stitch.Analytics.Segment.InMemory,
  analytics: Stitch.Analytics.TestClient

config :ex_aws,
  access_key_id: "fake-access-key-id",
  secret_access_key: "fake-secret-access-key"

config :stitch, :aws_user_upload, %{
  access_key_id: "fake-access-key-id",
  secret_access_key: "fake-secret-access-key",
  region: "us-east-1",
  bucket: "some-bucket",
  scheme: "https://",
  host: "s3.amazonaws.com"
}

config :stitch, Stitch.Analytics.Sync.RecurringSync,
  enabled: false

config :stitch, async_tasks?: false

config :stitch, Stitch.Analytics.DailyReports.Scheduler,
  enabled: false
