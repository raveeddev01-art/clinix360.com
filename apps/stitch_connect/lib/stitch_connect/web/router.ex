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
  end
end
