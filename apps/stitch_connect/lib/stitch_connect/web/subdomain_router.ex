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

    get "/invitations/accept/:token", InvitationController, :accept

    get "/login", AuthenticationController, :login
    post "/login", AuthenticationController, :submit_login
    get "/logout", AuthenticationController, :logout
    get "/reset-password", AuthenticationController, :reset_password
    get "/reset-password/:token", AuthenticationController, :change_password
  end

  # Authenticated routes.
  scope "/", StitchConnect.Web do
    pipe_through :browser_authenticate

    get "/", PageController, :index

    get "/admin/team", AdminController, :index
    get "/admin/team/settings", AdminController, :index
    get "/admin/team/hipaa", AdminController, :index
    get "/admin/team/export", AdminController, :index
    get "/admin/you/profile", AdminController, :index
    get "/admin/you/account", AdminController, :index
    get "/admin/you/notifications", AdminController, :index
    get "/admin/users/invitations", AdminController, :index
    get "/admin/users/members", AdminController, :index
    get "/admin/users/pending", AdminController, :index
  end

  # API routes.
  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through :api

    get "/users/", UserController, :index
    put "/users/:id", UserController, :update
    get "/users/:id", UserController, :show
    post "/users/:id/deactivate", UserController, :deactivate
    put "/users/:id/update_password", UserController, :update_password
    put "/users/:id/avatar", UserController, :update_avatar
    delete "/users/:id/avatar", UserController, :delete_avatar
    post "/users/search", UserController, :search

    get "/invitations", InvitationController, :index
    post "/invitations", InvitationController, :create
    patch "/invitations/:id/revoke", InvitationController, :revoke
    patch "/invitations/:id/resend", InvitationController, :resend
    post "/invitations/accept/:token", InvitationController, :accept

    get "/groups", GroupController, :index
    post "/groups/search", GroupController, :search
    post "/groups/:id/invite/", GroupController, :invite
    post "/groups/:id/toggle-favorite", GroupController, :toggle_favorite
    post "/groups/:id/toggle-public", GroupController, :toggle_public
    post "/groups/:id/join", GroupController, :join
    post "/groups/:id/leave", GroupController, :leave

    get "/teams/:id", TeamController, :show
    delete "/teams/:id/", TeamController, :delete_team
    put "/teams/:id/update-security-lockout-time", TeamController, :update_security_lockout_time
    put "/teams/:id/update-open-invitation", TeamController, :update_open_invitation
    put "/teams/:id", TeamController, :update
    post "/teams/:id/send-invite", TeamController, :send_invite

    post "/upload-signature", UploadSignatureController, :create

    post "/login", AuthenticationController, :submit_login
    post "/reset_password", AuthenticationController, :reset_password
  end
end
