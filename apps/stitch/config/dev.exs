use Mix.Config

config :stitch, Stitch.Repo,
  adapter: Ecto.Adapters.Postgres,
  password: System.get_env("STITCH_POSTGRES_PASSWORD"),
  database: "stitch_dev"

config :stitch, Stitch.Mailer,
  adapter: Bamboo.MandrillAdapter,
  api_key: System.get_env("MANDRILL_API_KEY")

config :stitch, Stitch.Exports,
  enabled: true

# Sentry configuration for Development
config :sentry,
  dsn: "https://6067162547ba4f29b3f0114b9cee78e4:7f982ad38fda42d89caaef319eb23ec1@sentry.io/233794",
  environment_name: :dev,
  enable_source_code_context: true,
  root_source_code_path: File.cwd!,
  tags: %{
    env: "development"
  },
  included_environments: [:dev]
