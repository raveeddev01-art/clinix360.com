defmodule StitchConnect.Web.Endpoint do
  use Phoenix.Endpoint, otp_app: :stitch_connect
  use Plug.Builder

  socket "/socket", StitchConnect.Web.UserSocket

  if Application.get_env(:stitch_connect, :sql_sandbox) do
    plug Phoenix.Ecto.SQL.Sandbox
  end

  # Overwrite the conn.remote_ip with values taken from
  # X-Forwarded-For used in Heroku and Aptible.
  plug RemoteIp

  # Serve at "/" the static files from "priv/static" directory.
  #
  # You should set gzip to true if you are running phoenix.digest
  # when deploying your static files in production.
  plug Plug.Static,
    at: "/", from: :stitch_connect, gzip: false,
    only: ~w(js css fonts images audios favicon.ico favicon-192x192.png robots.txt)

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    socket "/phoenix/live_reload/socket", Phoenix.LiveReloader.Socket
    plug Phoenix.LiveReloader
    plug Phoenix.CodeReloader
  end

  plug Plug.RequestId
  plug Plug.Logger

  # Enable Corsica to allow CORS from any domain.
  plug Corsica, origins: "*"

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Poison

  plug Plug.MethodOverride
  plug Plug.Head

  # The session will be stored in the cookie and signed,
  # this means its contents can be read but not tampered with.
  # Set :encryption_salt if you would also like to encrypt it.
  plug Plug.Session,
    store: :cookie,
    key: "_stitch_connect_key",
    signing_salt: "o9McnPJj",
    # Setting domain to nil is necessary for integration tests to pass. Maybe
    # a bug in Wallaby?
    #
    # Setting domain to the APP_HOST env variable with a leading dot lets us
    # share cookies between domain and subdomains for auto-login after
    # on-boarding.
    domain: if Application.fetch_env!(:stitch_connect, :env) == :test, do: nil, else: ".#{System.get_env("APP_HOST")}"

  # Add AppSignal instrumentation
  use Appsignal.Phoenix

  plug StitchConnect.Plug.Subdomain, StitchConnect.Web.SubdomainRouter
  plug StitchConnect.Web.Router

  @doc """
  Dynamically loads configuration from the system environment
  on startup.

  It receives the endpoint configuration from the config files
  and must return the updated configuration.
  """
  def load_from_system_env(config) do
    port = System.get_env("PORT") || raise "expected the PORT environment variable to be set"
    {:ok, Keyword.put(config, :http, [:inet6, port: port])}
  end
end
