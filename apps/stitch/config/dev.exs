use Mix.Config

config :stitch, Stitch.Repo,
  adapter: Ecto.Adapters.Postgres,
  password: System.get_env("STITCH_POSTGRES_PASSWORD"),
  database: "stitch_dev"

config :stitch, Stitch.Mailer,
  adapter: Bamboo.MandrillAdapter,
  api_key: System.get_env("MANDRILL_API_KEY")

# NOTE: temporary (for testing only)
config :stitch, Stitch,
  sender_email: System.get_env("SENDER_EMAIL"),
  recipient_email: System.get_env("RECIPIENT_EMAIL")
