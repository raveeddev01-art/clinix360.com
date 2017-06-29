defmodule StitchConnect.Web.Router do
  use StitchConnect.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug :fetch_session
  end

  scope "/", StitchConnect.Web do
    pipe_through :browser

    get "/", AuthenticationController, :index
    get "/signin", AuthenticationController, :index

    get "/login", AuthenticationController, :index
    get "/reset-password", AuthenticationController, :index

    get "/signup/email", AuthenticationController, :index
    get "/signup/confirmation-code", AuthenticationController, :index
    get "/signup/team-name", AuthenticationController, :index
    get "/signup/full-name", AuthenticationController, :index
    get "/signup/phone-number", AuthenticationController, :index
    get "/signup/username", AuthenticationController, :index
    get "/signup/password", AuthenticationController, :index
    get "/signup/pin", AuthenticationController, :index
    get "/signup/invites", AuthenticationController, :index
    get "/signup/hipaa", AuthenticationController, :index
    get "/signup/app-download", AuthenticationController, :index
  end

  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through :api

    post "/users/create", UserController, :create
    post "/users/update", UserController, :update
    post "/users/submit_confirmation_code", UserController, :submit_confirmation_code

    post "/teams/create", TeamController, :create
  end
end
