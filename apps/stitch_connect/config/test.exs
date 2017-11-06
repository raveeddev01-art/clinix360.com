use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :stitch_connect, StitchConnect.Web.Endpoint,
  http: [port: 4001],
  url: [host: "localhost"],
  server: false
