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

  pipeline :api_auth do
    plug :accepts, ["json"]
    plug :fetch_session
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  # API routes which don't need token.
  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through :api

    post "/users/exists", UserController, :exists?
    post "/invitations/accept/:token", InvitationController, :accept
  end

  # API routes which need token.
  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through :api_auth

    get "/groups/:group_id/messages", MessageController, :index
    post "/messages/:id/toggle-star", MessageController, :toggle_star
    post "/messages/:id/toggle-pin", MessageController, :toggle_pin

    get "/users/", UserController, :index
    put "/users/:id", UserController, :update
    get "/users/:id", UserController, :show
    post "/users/:id/deactivate", UserController, :deactivate
    put "/users/:id/update_password", UserController, :update_password
    put "/users/:id/avatar", UserController, :update_avatar
    delete "/users/:id/avatar", UserController, :delete_avatar
    post "/users/search", UserController, :search

    get "/invitations", InvitationController, :index
    get "/invitations/:token", InvitationController, :show
    post "/invitations", InvitationController, :create
    patch "/invitations/:id/revoke", InvitationController, :revoke
    patch "/invitations/:id/resend", InvitationController, :resend

    get "/groups", GroupController, :index
    get "/groups/:id", GroupController, :show
    post "/groups", GroupController, :create
    post "/groups/search", GroupController, :search
    post "/groups/:id/invite/", GroupController, :invite
    post "/groups/:id/toggle-favorite", GroupController, :toggle_favorite
    post "/groups/:id/toggle-public", GroupController, :toggle_public
    post "/groups/:id/join", GroupController, :join
    post "/groups/:id/leave", GroupController, :leave
    get "/groups/:id/users", GroupController, :users
    patch "/groups/:id/rename", GroupController, :rename

    get "/groups/:group_id/notification-preference", GroupNotificationPreferenceController, :show
    post "/groups/:group_id/update-notification-preference", GroupNotificationPreferenceController, :update

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

    get "/groups/:slug", GroupController, :index

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
end
