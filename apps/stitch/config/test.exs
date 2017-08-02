use Mix.Config

config :comeonin, :bcrypt_log_rounds, 4

config :stitch, Stitch.Repo,
  adapter: Ecto.Adapters.Postgres,
  database: "stitch_test",
  hostname: "localhost",
  port: 5432,
  pool: Ecto.Adapters.SQL.Sandbox

config :stitch, Stitch.Mailer,
  adapter: Bamboo.TestAdapter
