use Mix.Config

# Do not print debug messages in production
config :logger, level: :info

config :appsignal, :config,
  name: "stitch-phoenix",
  push_api_key: "fa210ad7-ab32-4513-bb9b-57bc406e846a",
  env: Mix.env
