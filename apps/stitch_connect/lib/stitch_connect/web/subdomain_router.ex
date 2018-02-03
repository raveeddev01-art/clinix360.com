defmodule StitchConnect.Web.SubdomainRouter do
  use StitchConnect.Web, :router

  pipeline :browser do
    plug StitchConnect.Plug.PlugAttack
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :browser_authenticate do
    plug StitchConnect.Plug.PlugAttack
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug StitchConnect.Plug.Authenticate
  end

  pipeline :admin do
    plug StitchConnect.Plug.PlugAttack
    plug StitchConnect.Plug.StaffAuthenticate
    plug :put_layout, {StitchConnect.Web.Admin.AppView, "layout.html"}
  end

  pipeline :api_auth do
    plug StitchConnect.Plug.PlugAttack
    plug :accepts, ["json"]
    plug :fetch_session
  end

  pipeline :api do
    plug StitchConnect.Plug.PlugAttack
    plug :accepts, ["json"]
  end

  pipeline :authenticated_api do
    plug StitchConnect.Plug.PlugAttack
    plug :accepts, ["json"]
    plug :fetch_session
    plug StitchConnect.Plug.ApiAuthenticate
    plug StitchConnect.Plug.EnsureUnlocked
  end

  pipeline :authenticated_locked_api do
    plug StitchConnect.Plug.PlugAttack
    plug :accepts, ["json"]
    plug :fetch_session
    plug StitchConnect.Plug.ApiAuthenticate
  end

  pipeline :team_admin_api do
    plug :accepts, ["json"]
    plug StitchConnect.Plug.PlugAttack
    plug :fetch_session
    plug StitchConnect.Plug.ApiAuthenticate
    plug StitchConnect.Plug.TeamAdminOnly
  end

  # Stitch Staff Admin subdomain routes
  scope "/", StitchConnect.Web.Admin, as: :admin, host: "admin." do
    pipe_through [:browser, :admin]
    get "/", IndexController, :index

    resources "/users", UserController, only: [:index]
    resources "/teams", TeamController, only: [:index]

    get "/impersonate/stop", ImpersonationController, :stop
    get "/impersonate/:user_id", ImpersonationController, :impersonate
  end

  # API routes which don't need token.
  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through :api

    get "/stitch-version", VersionController, :index
    get "/users/validate-username", UserController, :validate_username
    post "/users/exists", UserController, :exists?
    post "/users/validate-phone-number", UserController, :validate_phone_number
    post "/invitations/accept/:token", InvitationController, :accept
  end

  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through :authenticated_locked_api

    post "/session-lock", SessionLockController, :lock
    post "/session-unlock", SessionLockController, :unlock
    get "/groups", GroupController, :index
    get "/users/notification-preference", NotificationPreferenceController, :show_global
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
    put "/users/notification-preference", NotificationPreferenceController, :update_global
    get "/users/:id", UserController, :show
    put "/users/:id", UserController, :update
    put "/users/:id/update_password", UserController, :update_password
    put "/users/:id/upload_profile_image", UserController, :upload_profile_image
    delete "/users/:id/delete_profile_image", UserController, :delete_profile_image
    post "/users/search", UserController, :search

    scope "/invitations" do
      get "/", InvitationController, :index
      post "/", InvitationController, :create
      patch "/:id/revoke", InvitationController, :revoke
      patch "/:id/resend", InvitationController, :resend
    end

    get "/groups/:id", GroupController, :show
    post "/groups", GroupController, :create
    post "/groups/dm", GroupController, :create_single_dm
    post "/groups/multi_dm", GroupController, :create_multi_dm
    post "/groups/search", GroupController, :search
    post "/groups/:id/invite/", GroupController, :invite
    post "/groups/:id/toggle-favorite", GroupController, :toggle_favorite
    post "/groups/:id/toggle-public", GroupController, :toggle_public
    post "/groups/:id/join", GroupController, :join
    post "/groups/:id/leave", GroupController, :leave
    get "/groups/:id/users", GroupController, :users
    patch "/groups/:id/rename", GroupController, :rename
    put "/groups/:id/hide", GroupController, :hide
    put "/groups/:id/unhide", GroupController, :unhide

    get "/groups/:group_id/notification-preference", NotificationPreferenceController, :show
    put "/groups/:group_id/notification-preference", NotificationPreferenceController, :update

    get "/uploads",           UploadController, :index
    post "/upload-signature", UploadController, :create

    resources "/devices", DeviceController, only: [:create, :delete]
    post "/devices/unregister", DeviceController, :delete
  end

  # Routes which needs admin role
  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through :team_admin_api

    # User Settings admin routes
    scope "/users/:id" do
      post "/activate",     UserController, :activate
      post "/deactivate",   UserController, :deactivate
      put "/roles",         UserController, :change_role
      put "/revoke-admin",  UserController, :revoke_admin
      put "/promote-admin", UserController, :promote_admin
    end

    # Team Settings admin routes
    scope "/teams" do
      scope "/:id" do
        delete "/",                           TeamController, :delete_team
        get "/contact",                       TeamController, :show_contact_info
        put "/contact",                       TeamController, :update_contact_info
        put "/update-open-invitation",        TeamController, :update_open_invitation
        put "/update-security-lockout-time",  TeamController, :update_security_lockout_time
      end
    end

    # Subscription/Billing routes
    scope "/billing", Billing, as: :billing do
      scope "/subscription" do
        get "/",        SubscriptionController, :show
        put "/",        SubscriptionController, :update
        put "/renew",   SubscriptionController, :renew
        put "/cancel",  SubscriptionController, :cancel
      end

      resources "/history", HistoryController, only: [:index]
      resources "/cards", CardController, only: [:index, :create, :update, :delete]
    end

    # Guest invitation routes
    scope "/invitations" do
      post "/single-room-guest",  InvitationController, :invite_single_room_guest
      post "/single-room-guests", InvitationController, :invite_single_room_guests
      post "/multi-room-guest",   InvitationController, :invite_multi_room_guest
      post "/multi-room-guests",  InvitationController, :invite_multi_room_guests
    end

    # Initiate export by admin
    resources "/exports", ExportController, only: [:index, :create]

    # Admin repotes route
    resources "/reports", ReportController, only: [:create]
  end

  # API routes which need token.
  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through :api_auth

    get "/invitations/:token", InvitationController, :show

    get "/teams/:id", TeamController, :show
    put "/teams/:id", TeamController, :update

    post "/login", AuthenticationController, :submit_login
    post "/reset_password", AuthenticationController, :reset_password
  end

  # Anonymous routes.
  scope "/", StitchConnect.Web do
    pipe_through :browser

    scope "/invitations" do
      get "/error",   InvitationController, :error
      scope "/accept" do
        get "/:token",  InvitationController, :accept
        get "/:token/:step", InvitationController, :accept
      end
    end

    get "/login", AuthenticationController, :login

    get "/find-your-team/:token/login", AuthenticationController, :auto_login
    get "/logged-out", AuthenticationController, :logged_out

    get "/reset-password", AuthenticationController, :reset_password
    get "/reset-password/:token", AuthenticationController, :change_password
  end

  # Authenticated routes.
  scope "/", StitchConnect.Web do
    pipe_through :browser_authenticate

    get "/", PageController, :index
    get "/apps", AuthenticationController, :apps

    get "/logout", AuthenticationController, :logout

    get "/rooms/:slug", GroupController, :index
    get "/direct/:username", UserController, :index
    get "/messages/:id/download", MessageController, :download

    # TODO: a wild card route can make all /admin routes to one line
    get "/admin/team", AdminController, :index
    get "/admin/team/settings", AdminController, :index
    get "/admin/team/security", AdminController, :index
    get "/admin/you/home", AdminController, :index
    get "/admin/you/profile", AdminController, :index
    get "/admin/you/account", AdminController, :index
    get "/admin/you/notifications", AdminController, :index
    get "/admin/members", AdminController, :index
    get "/admin/billing", AdminController, :index
    get "/admin/analytics", AdminController, :index

    get "/exports/:id/download", ExportController, :download
  end
end
