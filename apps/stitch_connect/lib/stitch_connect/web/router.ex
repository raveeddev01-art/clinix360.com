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

  pipeline :authenticated_api do
    plug :accepts, ["json"]
    plug :fetch_session
    plug StitchConnect.Plug.ApiAuthenticate
  end

  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through :api

    post "/request-demo", UserController, :request_demo

    # Onboarding routes for new users.
    get "/users/validate-username", UserController, :validate_username
    post "/users", UserController, :create
    post "/users/validate-phone-number", UserController, :validate_phone_number
    post "/users/send-confirmation-code", UserController, :send_confirmation_code
    post "/users/submit-confirmation-code", UserController, :submit_confirmation_code
    post "/users/send-invite", UserController, :send_invite
    patch "/users/:id/complete-onboarding", UserController, :complete_onboarding

    post "/teams", TeamController, :create
    post "/teams/url-available", TeamController, :url_available
    post "/teams/slug-exists", TeamController, :slug_exists

    post "/find-your-team", FindYourTeamController, :create
    delete "/find-your-team/:token", FindYourTeamController, :delete
  end

  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through :authenticated_api

    get "/users/notification-preference", NotificationPreferenceController, :show_global
    put "/users/notification-preference", NotificationPreferenceController, :update_global
  end

  scope "/stripe", StitchConnect.Web do
    pipe_through :api

    post "/", StripeWebhookController, :event
  end

  scope "/", StitchConnect.Web do
    pipe_through :browser

    get "/", HomeController, :index
    get "/demo", HomeController, :index
    get "/connect", HomeController, :index
    get "/engage", HomeController, :index
    get "/manage", HomeController, :index
    get "/pricing", HomeController, :index
    get "/downloads", HomeController, :index
    get "/pilot", HomeController, :index
    get "/jobs", HomeController, :index
    get "/customers", HomeController, :index
    get "/blog", HomeController, :index
    get "/customers/luminance-recovery", HomeController, :index
    get "/customers/princeton-brain-spine", HomeController, :index
    get "/customers/dermatology-skin-surgery-institute", HomeController, :index
    get "/customers/UCSF-citywide", HomeController, :index
    get "/customers/orchard-medical-associates", HomeController, :index
    get "/baa", HomeController, :index
    get "/hipaa", HomeController, :index
    get "/privacy-policy", HomeController, :index
    get "/terms-of-service", HomeController, :index

    get "/getstarted", AuthenticationController, :index
    get "/signin", AuthenticationController, :index
    get "/find-your-team", AuthenticationController, :index
    get "/find-your-team/:token", AuthenticationController, :index

    # get "/login", AuthenticationController, :index
    # get "/reset-password", AuthenticationController, :index

    get "/signup/email", AuthenticationController, :index
    get "/signup/confirmation-code", AuthenticationController, :index
    get "/signup/onboarding/:step", AuthenticationController, :index
    get "/signup/app-download", AuthenticationController, :index

    # get "/signup/phone-number", AuthenticationController, :index
  end

  # Application download links.
  get "/download-mac", Redirect, external: "https://fz0pxcjnx9.execute-api.us-east-1.amazonaws.com/prod/latest-desktop-mac"
  get "/download-win", Redirect, external: "https://1lyrransd9.execute-api.us-east-1.amazonaws.com/prod/latest-desktop-win"
end
