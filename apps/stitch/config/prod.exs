use Mix.Config

# config :stitch, Stitch.Repo,
#   adapter: Ecto.Adapters.Postgres,
#   url: System.get_env("DATABASE_URL"),
#   pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
#   ssl: true
#
config :stitch, Stitch.Repo,
  adapter: Ecto.Adapters.Postgres,
  password: System.get_env("STITCH_POSTGRES_PASSWORD"),
  database: "stitch_dev",
  pool_size: 50

config :stitch, Stitch.Mailer,
  adapter: Bamboo.MandrillAdapter,
  api_key: System.get_env("MANDRILL_API_KEY")
