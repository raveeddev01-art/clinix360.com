use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :stitch_connect, StitchConnect.Web.Endpoint,
  http: [port: 4001],
  url: [host: "localhost"],
  server: true

config :wallaby,
  screenshot_on_failure: true,
  driver: Wallaby.Experimental.Chrome,
  chrome: [headless: true],
  base_url: "http://localhost:4001",
  js_logger: false

config :stitch_connect, :message_link_previews,
  generate_pending?: false,
  setup_async_child: &StitchConnect.MessageLinkPreview.Generator.repo_allow_async_child/2

config :stitch_connect, :sql_sandbox, true

config :stitch_connect,
  application_host: "localhost:4001",
  application_scheme: "http://",
  websocket_scheme: "ws://",
  apns_topic: "apns-topic"
