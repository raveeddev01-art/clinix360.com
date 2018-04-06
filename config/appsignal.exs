use Mix.Config

config :appsignal, :config,
  name: "stitch-phoenix",
  push_api_key: "fa210ad7-ab32-4513-bb9b-57bc406e846a",
  env: Mix.env,
  active: true,
  filter_parameters: ["password", "text_content", "message", "new_password", "old_password"]
