use Mix.Config

config :stitch, Stitch.Repo,
  adapter: Ecto.Adapters.Postgres,
  url: System.get_env("DATABASE_URL"),
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
  ssl: true,
  loggers: [Appsignal.Ecto, Ecto.LogEntry]

config :stitch, Stitch.Mailer,
  adapter: Bamboo.MandrillAdapter,
  api_key: System.get_env("MANDRILL_API_KEY")

# Sentry configuration for Production
config :sentry,
  dsn: "https://9b8f91a0ec7349c5a75ff5c9f87a78bb:f83a2dd1467e42b48fb6111af7a894e8@sentry.io/233795",
  environment_name: :prod,
  enable_source_code_context: true,
  root_source_code_path: File.cwd!,
  tags: %{
    env: "prod"
  },
  included_environments: [:prod]