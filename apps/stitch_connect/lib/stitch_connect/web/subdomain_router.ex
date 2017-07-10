defmodule StitchConnect.Web.SubdomainRouter do
  use StitchConnect.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :browser_authenticate do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug StitchConnect.Plug.Authenticate
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  # Anonymous routes.
  scope "/", StitchConnect.Web do
    pipe_through :browser

    get "/login", AuthenticationController, :login
  end

  # Authenticated routes.
  scope "/", StitchConnect.Web do
    pipe_through :browser_authenticate

    get "/", PageController, :index
  end
end