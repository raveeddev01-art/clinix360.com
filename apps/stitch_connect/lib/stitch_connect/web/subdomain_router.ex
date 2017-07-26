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
    plug :fetch_session
  end

  # Anonymous routes.
  scope "/", StitchConnect.Web do
    pipe_through :browser

    get "/login", AuthenticationController, :login
    post "/login", AuthenticationController, :submit_login
  end

  # Authenticated routes.
  scope "/", StitchConnect.Web do
    pipe_through :browser_authenticate

    get "/", PageController, :index
    get "/admin/team", AdminController, :index
  end

  # API routes.
  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through :api

    get "/users/", UserController, :index
    get "/rooms/", RoomController, :index

    post "/login", AuthenticationController, :submit_login
  end
end