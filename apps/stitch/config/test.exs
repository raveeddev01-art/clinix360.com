use Mix.Config

config :comeonin, :bcrypt_log_rounds, 4

config :stitch, Stitch.Repo,
  adapter: Ecto.Adapters.Postgres,
  database: "stitch_test",
  hostname: "localhost",
  password: System.get_env("STITCH_POSTGRES_PASSWORD"),
  port: String.to_integer(System.get_env("PSQL_PORT") || "5432"),
  pool: Ecto.Adapters.SQL.Sandbox

config :stitch, Stitch.Mailer,
  adapter: Bamboo.TestAdapter
