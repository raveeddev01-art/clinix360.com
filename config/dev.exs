use Mix.Config

# Do not include metadata nor timestamps in development logs
config :logger, :console, format: "[$level] $message\n"

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20

config :appsignal, :config,
  name: "stitch-phoenix",
  push_api_key: "fa210ad7-ab32-4513-bb9b-57bc406e846a",
  env: Mix.env
