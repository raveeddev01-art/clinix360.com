use Mix.Config

config :bcrypt_elixir, :log_rounds, 4

config :stitch, Stitch.Repo,
  adapter: Ecto.Adapters.Postgres,
  password: System.get_env("STITCH_POSTGRES_PASSWORD"),
  database: "stitch_test",
  hostname: "localhost",
  port: String.to_integer(System.get_env("PSQL_PORT") || "5432"),
  pool: Ecto.Adapters.SQL.Sandbox

config :stitch, Stitch.Mailer,
  adapter: Bamboo.TestAdapter

config :stitch, Stitch.Exports,
  enabled: false

config :stitch,
  stripe_client: Stitch.Stripe.TestClient,
  segment_api: Stitch.Analytics.Segment.InMemory

config :stitch, :aws_presigned_urls, %{
  access_key_id: "some-access-key-id",
  secret_access_key: "some-secret-access-key",
  region: "us-east-1",
  host: "s3.amazonaws.com",
  scheme: "https://"
}

config :stitch, Stitch.Analytics.Sync.RecurringSync,
  enabled: false
