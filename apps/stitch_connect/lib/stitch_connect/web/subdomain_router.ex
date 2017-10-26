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

  pipeline :authenticated_api do
    plug :accepts, ["json"]
    plug :fetch_session
    plug StitchConnect.Plug.ApiAuthenticate
    plug StitchConnect.Plug.EnsureUnlocked
  end

  pipeline :authenticated_locked_api do
    plug :accepts, ["json"]
    plug :fetch_session
    plug StitchConnect.Plug.ApiAuthenticate
  end

  pipeline :team_admin_api do
    plug :accepts, ["json"]
    plug :fetch_session
    plug StitchConnect.Plug.ApiAuthenticate
    plug StitchConnect.Plug.TeamAdminOnly
  end

  # API routes which don't need token.
  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through :api

    post "/users/exists", UserController, :exists?
    post "/invitations/accept/:token", InvitationController, :accept
  end

  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through :authenticated_api

    get "/groups/:group_id/messages", MessageController, :index
    post "/groups/:group_id/messages", MessageController, :create
    put "/messages/:id", MessageController, :update
    delete "/messages/:id", MessageController, :delete
    get "/messages/:id/download", MessageController, :download
    post "/messages/:id/toggle-star", MessageController, :toggle_star
    post "/messages/:id/toggle-pin", MessageController, :toggle_pin
    post "/messages/search", MessageController, :search

    get "/starred_messages", StarredMessageController, :index
    get "/pinned_messages", PinnedMessageController, :index
    get "/mentions", MentionController, :index

    get "/users/", UserController, :index
    get "/users/notification-preference", NotificationPreferenceController, :show_global
    put "/users/notification-preference", NotificationPreferenceController, :update_global
    get "/users/:id", UserController, :show
    put "/users/:id", UserController, :update
    post "/users/search", UserController, :search

    get "/invitations", InvitationController, :index
    post "/invitations", InvitationController, :create
    patch "/invitations/:id/revoke", InvitationController, :revoke
    patch "/invitations/:id/resend", InvitationController, :resend

    get "/groups", GroupController, :index
    get "/groups/:id", GroupController, :show
    post "/groups", GroupController, :create
    post "/groups/dm", GroupController, :create_single_dm
    post "/groups/multi-dm", GroupController, :create_multi_dm
    post "/groups/search", GroupController, :search
    post "/groups/:id/invite/", GroupController, :invite
    post "/groups/:id/toggle-favorite", GroupController, :toggle_favorite
    post "/groups/:id/toggle-public", GroupController, :toggle_public
    post "/groups/:id/join", GroupController, :join
    post "/groups/:id/leave", GroupController, :leave
    get "/groups/:id/users", GroupController, :users
    patch "/groups/:id/rename", GroupController, :rename
    put "/groups/:id/hide", GroupController, :hide

    get "/groups/:group_id/notification-preference", NotificationPreferenceController, :show
    put "/groups/:group_id/notification-preference", NotificationPreferenceController, :update

    get "/uploads",           UploadController, :index
    post "/upload-signature", UploadController, :create

    resources "/devices", DeviceController, only: [:create]
  end

  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through :authenticated_locked_api

    post "/session-lock", SessionLockController, :lock
    post "/session-unlock", SessionLockController, :unlock
  end

  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through :team_admin_api

    post "/users/:id/activate", UserController, :activate
    post "/users/:id/deactivate", UserController, :deactivate
    put "/users/:id/promote-admin", UserController, :promote_admin
    put "/users/:id/revoke-admin", UserController, :revoke_admin

    delete "/teams/:id/", TeamController, :delete_team
    put "/teams/:id/update-security-lockout-time", TeamController, :update_security_lockout_time
    put "/teams/:id/update-open-invitation", TeamController, :update_open_invitation

    resources  "/exports", ExportController, only: [:index, :create]
    get  "/exports/:id/download", ExportController, :download
  end

  # Subscription/Billing routes
  scope "/api/v1/billing", StitchConnect.Web.Api.V1.Billing, as: :api_v1_billing do
    pipe_through :team_admin_api

    get "/cards", CardController, :index
    post "/cards", CardController, :create
    put "/cards/:id", CardController, :update
    delete "/cards/:id", CardController, :delete

    get "/subscription", SubscriptionController, :show
    put "/subscription", SubscriptionController, :update

    put "/subscription/cancel", SubscriptionController, :cancel
    put "/subscription/renew", SubscriptionController, :renew
  end

  # API routes which need token.
  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through :api_auth

    put "/users/:id/update_password", UserController, :update_password
    put "/users/:id/avatar", UserController, :update_avatar
    delete "/users/:id/avatar", UserController, :delete_avatar

    get "/invitations/:token", InvitationController, :show

    get "/teams/:id", TeamController, :show
    put "/teams/:id", TeamController, :update
    post "/teams/:id/send-invite", TeamController, :send_invite

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

    get "/rooms/:slug", GroupController, :index
    get "/direct/:username", UserController, :index
    get "/messages/:id/download", MessageController, :download

    get "/admin/team", AdminController, :index
    get "/admin/team/settings", AdminController, :index
    get "/admin/team/security", AdminController, :index
    get "/admin/you/profile", AdminController, :index
    get "/admin/you/account", AdminController, :index
    get "/admin/you/notifications", AdminController, :index
    get "/admin/users/invitations", AdminController, :index
    get "/admin/users/members", AdminController, :index
    get "/admin/users/pending", AdminController, :index
    get "/admin/billing", AdminController, :index
  end
end
