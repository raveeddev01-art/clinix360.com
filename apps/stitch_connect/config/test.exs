use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :stitch_connect, StitchConnect.Web.Endpoint,
  http: [port: 4001],
  url: [host: "localhost"],
  server: true

config :wallaby,
  screenshot_on_failure: true,
  driver: Wallaby.Experimental.Chrome

config :stitch_connect, :start_message_link_preview_generator, false

config :stitch_connect, :sql_sandbox, true

config :stitch_connect,
  application_host: "localhost:4001",
  application_scheme: "http://"
