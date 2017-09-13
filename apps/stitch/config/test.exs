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
