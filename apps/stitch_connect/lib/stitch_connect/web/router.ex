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
  end

  scope "/", StitchConnect.Web do
    pipe_through :browser

    get "/", AuthenticationController, :index
    get "/login", AuthenticationController, :index
    get "/reset-password", AuthenticationController, :index

    get "/signup/email", AuthenticationController, :index
    get "/signup/confirmation-code", AuthenticationController, :index
    get "/signup/team-name", AuthenticationController, :index
    get "/signup/first-name", AuthenticationController, :index
    get "/signup/last-name", AuthenticationController, :index
    get "/signup/phone-number", AuthenticationController, :index
    get "/signup/username", AuthenticationController, :index
    get "/signup/password", AuthenticationController, :index
    get "/signup/pin", AuthenticationController, :index
    get "/signup/invites", AuthenticationController, :index
    get "/signup/hipaa", AuthenticationController, :index
    get "/signup/app-download", AuthenticationController, :index
  end
end
