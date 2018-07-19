defmodule Stitch.Web.SubdomainRouter do
  use Stitch.Web, :router

  # =============
  #   PIPELINES
  # =============

  pipeline :browser do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_flash)
    plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
  end

  pipeline :browser_authenticate do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_flash)
    plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
    plug(Stitch.Web.Plug.Authenticate)
    plug(Stitch.Web.Plug.ActivityTracker)
  end

  pipeline :admin do
    plug(Stitch.Web.Plug.StaffAuthenticate)
    plug(:put_layout, {Stitch.Web.Admin.AppView, "layout.html"})
  end

  pipeline :api_auth do
    plug(:accepts, ["json"])
    plug(:fetch_session)
  end

  pipeline :api do
    plug(:accepts, ["json"])
  end

  pipeline :authenticated_api do
    plug(:accepts, ["json"])
    plug(:fetch_session)
    plug(Stitch.Web.Plug.ApiAuthenticate)
    plug(Stitch.Web.Plug.EnsureUnlocked)
    plug(Stitch.Web.Plug.ActivityTracker)
  end

  pipeline :authenticated_locked_api do
    plug(:accepts, ["json"])
    plug(:fetch_session)
    plug(Stitch.Web.Plug.ApiAuthenticate)
  end

  pipeline :team_admin_api do
    plug(:accepts, ["json"])
    plug(:fetch_session)
    plug(Stitch.Web.Plug.ApiAuthenticate)
    plug(Stitch.Web.Plug.TeamAdminOnly)
    plug(Stitch.Web.Plug.ActivityTracker)
  end

  pipeline :files do
    plug(:fetch_session)
  end

  pipeline :patient_browser do
    plug(Stitch.Web.Plug.PatientAuthenticate, [:browser])
  end

  pipeline :patient_api do
    plug(:accepts, ["json"])
    plug(:fetch_session)
    plug(Stitch.Web.Plug.PatientAuthenticate, [:api])
  end

  pipeline :patient_auth_api do
    plug(:accepts, ["json"])
    plug(:fetch_session)
  end

  pipeline :patient_auth do
    plug(Stitch.Web.Plug.PatientAuthenticate, [:auth])
  end

  # ================
  #   FILES ROUTES
  # ================

  scope "/", Stitch.Web.Files, as: :files, host: "files." do
    pipe_through([:files])

    get("/f/:file_id", PublicFileController, :public_download)
    get("/file/:file_id/:filename", FileController, :download)
    get("/preview/:file_id", FileController, :download_preview)
  end

  # ==================
  #   PATIENT ROUTES
  # ==================

  scope "/api/v1/patient", Stitch.Web.Api.V1, as: :api_v1 do
    pipe_through([:api, :patient_api])
    put("/info", PatientController, :update_as_patient)
  end

  scope "/api/v1/patient", StitchEngage.Web.Api.V1, as: :api_v1 do
    pipe_through([:api, :patient_api])

    get("/", PatientController, :show)
    get("/inboxes/default", InboxController, :patient_default)

    get("/inboxes/:inbox_id/conversations", ConversationController, :patient_index)
    post("/inboxes/:inbox_id/conversations", ConversationController, :patient_create)
    get("/conversations/:id", ConversationController, :patient_show)

    get("/conversations/:conversation_id/messages", ConversationMessageController, :patient_index)
    get("/conversation_messages/:id", ConversationMessageController, :patient_show)

    post(
      "/conversations/:conversation_id/messages",
      ConversationMessageController,
      :patient_create
    )

    put(
      "/conversation_messages/:id/toggle_reaction",
      ConversationMessageController,
      :patient_toggle_reaction
    )

    put(
      "/conversation_messages/:id/delete_link_preview",
      ConversationMessageController,
      :patient_delete_message_link_preview
    )

    post(
      "/conversations/:conversation_id/mark_as_read",
      ConversationMessageController,
      :patient_mark_as_read
    )
  end

  scope "/patient", as: :patient do
    pipe_through([:browser, :patient_auth])
    get("/login", StitchEngage.Web.PatientAuthenticationController, :login)

    get("/logout", StitchEngage.Web.PatientAuthenticationController, :logout)
    get("/logged-out", StitchEngage.Web.PatientAuthenticationController, :logged_out)

    get("/login", StitchEngage.Web.PatientAuthenticationController, :login)

    scope "/invitations" do
      get("/error", StitchConnect.Web.InvitationController, :error)

      scope "/accept" do
        get("/:token", StitchConnect.Web.InvitationController, :patient_accept)
        get("/:token/:step", StitchConnect.Web.InvitationController, :patient_accept)
      end
    end
  end

  scope "/patient", StitchEngage.Web, as: :patient do
    pipe_through([:browser, :patient_browser])

    get("/", PatientController, :index)
  end

  # ================
  #   ADMIN ROUTES
  # ================

  # Stitch Staff Admin subdomain routes
  scope "/", Stitch.Web.Admin, as: :admin, host: "admin." do
    pipe_through([:browser, :admin])
    get("/", IndexController, :index)

    resources("/users", UserController, only: [:index])
    resources("/teams", TeamController, only: [:index])

    get("/impersonate/stop", ImpersonationController, :stop)
    get("/impersonate/:user_id", ImpersonationController, :impersonate)
  end

  # =================================
  #   STITCH ROUTES (CROSS-PRODUCT)
  # =================================

  # API routes which don't need token.
  scope "/api/v1", Stitch.Web.Api.V1, as: :api_v1 do
    pipe_through(:api)

    get("/users/validate-username", UserController, :validate_username)
    post("/users/exists", UserController, :exists?)
    post("/users/validate-phone-number", UserController, :validate_phone_number)

    get("/stitch-version", VersionController, :index)
  end

  scope "/api/v1", Stitch.Web.Api.V1, as: :api_v1 do
    pipe_through(:authenticated_locked_api)

    post("/session-lock", SessionLockController, :lock)
    post("/session-unlock", SessionLockController, :unlock)
  end

  # ====
  # NOTE: Some StitchConnect routes up here to pattern match first
  # ====
  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through(:authenticated_locked_api)
    get("/users/notification-preference", NotificationPreferenceController, :show_global)
  end

  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through(:authenticated_api)
    put("/users/notification-preference", NotificationPreferenceController, :update_global)
  end

  # ====
  # End of connect-specific routes
  # ====

  scope "/api/v1", Stitch.Web.Api.V1, as: :api_v1 do
    pipe_through(:authenticated_api)

    get("/users/", UserController, :index)
    post("/users/deactivate-my-account", UserController, :deactivate_my_account)
    get("/users/:id", UserController, :show)
    put("/users/:id", UserController, :update)
    get("/users/:id/avatar", UserController, :profile_image)
    put("/users/:id/update_password", UserController, :update_password)
    put("/users/:id/upload_profile_image", UserController, :upload_profile_image)
    delete("/users/:id/delete_profile_image", UserController, :delete_profile_image)
    post("/users/search", UserController, :search)
    post("/users/access", UserController, :access)

    scope "/files/:upload_id" do
      resources("/comments", FileCommentController, only: [:create])
    end

    resources("/file_comments", FileCommentController, only: [:update, :delete])
    resources("/files", FileController, only: [:index, :show, :delete])

    post("/files/:id/toggle_star", FileController, :toggle_star)
    post("/files/:id/share", FileController, :share)
    post("/files/:id/unshare", FileController, :unshare)
    post("/files/:id/create_public_link", FileController, :create_public_link)
    post("/files/:id/revoke_public_link", FileController, :revoke_public_link)
    get("/files/:id/presigned_url", FileController, :presigned_url)

    get("/patients", PatientController, :index)
    get("/patients/:id", PatientController, :show)
    post("/patients", PatientController, :create)
    put("/patients/:id", PatientController, :update)
    put("/patients/:id/activate", PatientController, :activate)
    put("/patients/:id/deactivate", PatientController, :deactivate)
  end

  scope "/api/v1", Stitch.Web.Api.V1, as: :api_v1 do
    pipe_through(:team_admin_api)

    # User Settings admin routes
    scope "/users/:id" do
      post("/activate", UserController, :activate)
      post("/deactivate", UserController, :deactivate)
      put("/roles", UserController, :change_role)
      put("/revoke-admin", UserController, :revoke_admin)
      put("/promote-admin", UserController, :promote_admin)
    end

    # Team Settings admin routes
    scope "/teams/:id" do
      delete("/", TeamController, :delete_team)
      put("/toggle-conceal", TeamController, :toggle_conceal)
      get("/contact", TeamController, :show_contact_info)
      put("/contact", TeamController, :update_contact_info)
      put("/update-open-invitation", TeamController, :update_open_invitation)
      put("/update-security-lockout-time", TeamController, :update_security_lockout_time)
      get("/access_log", TeamController, :access_log)
    end

    # Subscription/Billing routes
    scope "/billing", Billing, as: :billing do
      scope "/subscription" do
        get("/", SubscriptionController, :show)
        put("/", SubscriptionController, :update)
        put("/renew", SubscriptionController, :renew)
        put("/cancel", SubscriptionController, :cancel)
      end

      resources("/history", HistoryController, only: [:index])
      resources("/cards", CardController, only: [:index, :create, :update, :delete])
    end
  end

  # Routes which needs admin role
  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through(:team_admin_api)

    # Guest invitation routes
    scope "/invitations" do
      post("/single-room-guest", InvitationController, :invite_single_room_guest)
      post("/single-room-guests", InvitationController, :invite_single_room_guests)
      post("/multi-room-guest", InvitationController, :invite_multi_room_guest)
      post("/multi-room-guests", InvitationController, :invite_multi_room_guests)
    end

    scope "/bots" do
      get("/", BotsController, :index)
      post("/", BotsController, :create)
      put("/:id", BotsController, :update)
    end

    # Initiate export by admin
    resources("/exports", ExportController, only: [:index, :create])

    # Admin repotes route
    resources("/reports", ReportController, only: [:create])
  end

  # API routes which need token.
  scope "/api/v1", Stitch.Web.Api.V1, as: :api_v1 do
    pipe_through(:api_auth)

    get("/teams/:id", TeamController, :show)
    put("/teams/:id", TeamController, :update)

    post("/login", AuthenticationController, :submit_login)
    post("/patient/login", AuthenticationController, :submit_patient_login)
    post("/reset_password", AuthenticationController, :reset_password)
    post("/patient/reset_password", AuthenticationController, :patient_reset_password)
  end

  # API routes which need token.
  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through(:api_auth)

    get("/invitations/:token", InvitationController, :show)
  end

  # Anonymous routes.
  scope "/", Stitch.Web do
    pipe_through(:browser)

    get("/login", AuthenticationController, :login)

    get("/find-your-team/:token/login", AuthenticationController, :auto_login)
    get("/patient/find-your-team/:token/login", AuthenticationController, :patient_auto_login)
    get("/logged-out", AuthenticationController, :logged_out)

    get("/reset-password", AuthenticationController, :reset_password)
    get("/reset-password/:token", AuthenticationController, :change_password)

    get("/patient/reset-password", AuthenticationController, :patient_reset_password)
    get("/patient/reset-password/:token", AuthenticationController, :patient_change_password)
  end

  # Authenticated routes.
  scope "/", Stitch.Web do
    pipe_through(:browser_authenticate)

    get("/", PageController, :index)

    # TODO: a wild card route can make all /admin routes to one line
    get("/admin/team", PageController, :index)
    get("/admin/team/settings", PageController, :index)
    get("/admin/team/security", PageController, :index)
    get("/admin/you/home", PageController, :index)
    get("/admin/you/profile", PageController, :index)
    get("/admin/you/account", PageController, :index)
    get("/admin/you/notifications", PageController, :index)
    get("/admin/members", PageController, :index)
    get("/admin/billing", PageController, :index)
    get("/admin/analytics", PageController, :index)

    get("/admin/integrations", PageController, :index, as: :admin_integrations)
    get("/admin/integrations/:integration/new", PageController, :index)

    get(
      "/admin/integrations/drchrono/:integration_config_id/edit",
      PageController,
      :index,
      as: :admin_integration_edit
    )

    get("/admin/integrations/:slug", PageController, :index)
    get("/admin/integrations/:slug/edit", PageController, :index)

    get("/direct/:username", PageController, :user)
    get("/apps", AuthenticationController, :apps)
    get("/logout", AuthenticationController, :logout)

    get("/engage", PageController, :index)
    get("/conversations/:id", PageController, :index)

    get("/manage", PageController, :index)
    get("/patients", PageController, :index)
    get("/patients/:id", PageController, :index)

    get("/admin/files", PageController, :index)
    get("/admin/files/:id", PageController, :index)
  end

  # =========================
  #   STITCH CONNECT ROUTES
  # =========================

  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through(:authenticated_locked_api)

    get("/groups", GroupController, :index)
  end

  # API routes which don't need token.
  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through(:api)

    post("/invitations/accept/:token", InvitationController, :accept)
    post("/patient/invitations/accept/:token", InvitationController, :patient_accept)
    get("/apps", AppController, :index)
    get("/news", NewsController, :index)
  end

  scope "/api/v1", StitchConnect.Web.Api.V1, as: :api_v1 do
    pipe_through(:authenticated_api)

    get("/groups/:group_id/messages", MessageController, :index)
    get("/groups/:group_id/feed_recent", MessageController, :feed_recent)
    get("/groups/:group_id/feed_surrounding", MessageController, :feed_surrounding)
    post("/groups/:group_id/mark_as_read", MessageController, :mark_as_read)
    post("/groups/:group_id/mark_as_unread", MessageController, :mark_as_unread)
    post("/groups/:group_id/messages", MessageController, :create)
    put("/messages/:id", MessageController, :update)
    put("/messages/:id/delete_link_preview", MessageController, :delete_message_link_preview)
    put("/messages/:id/toggle_reaction", MessageController, :toggle_reaction)
    delete("/messages/:id", MessageController, :delete)
    get("/messages/:id/download", MessageController, :download)
    post("/messages/:id/toggle-star", MessageController, :toggle_star)
    post("/messages/:id/toggle-pin", MessageController, :toggle_pin)
    post("/messages/search", MessageController, :search)

    get("/starred_messages", StarredMessageController, :index)
    get("/starred_items", StarredItemController, :index)
    get("/pinned_messages", PinnedMessageController, :index)
    get("/mentions", MentionController, :index)

    get("/integrations", IntegrationController, :index)
    post("/integrations", IntegrationController, :create)
    post("/integrations/:id", IntegrationController, :update)
    delete("/integrations/:id", IntegrationController, :delete)
    post("/integrations/:id/enable", IntegrationController, :enable)
    post("/integrations/:id/disable", IntegrationController, :disable)

    scope "/invitations" do
      get("/", InvitationController, :index)
      post("/", InvitationController, :create)
      patch("/:id/revoke", InvitationController, :revoke)
      patch("/:id/resend", InvitationController, :resend)
    end

    get("/groups/:id", GroupController, :show)
    post("/groups", GroupController, :create)
    post("/groups/dm", GroupController, :create_single_dm)
    post("/groups/multi_dm", GroupController, :create_multi_dm)
    post("/groups/search", GroupController, :search)
    post("/groups/:id/invite/", GroupController, :invite)
    post("/groups/:id/remove_users", GroupController, :remove_users)
    post("/groups/:id/toggle-favorite", GroupController, :toggle_favorite)
    post("/groups/:id/toggle-public", GroupController, :toggle_public)
    post("/groups/:id/join", GroupController, :join)
    post("/groups/:id/leave", GroupController, :leave)
    get("/groups/:id/users", GroupController, :users)
    patch("/groups/:id/rename", GroupController, :rename)
    delete("/groups/:id", GroupController, :delete)
    put("/groups/:id/hide", GroupController, :hide)
    put("/groups/:id/unhide", GroupController, :unhide)

    get("/groups/:group_id/notification-preference", NotificationPreferenceController, :show)
    put("/groups/:group_id/notification-preference", NotificationPreferenceController, :update)

    get("/uploads", UploadController, :index)
    post("/upload-signature", UploadController, :create)

    resources("/devices", DeviceController, only: [:create, :delete])
    post("/devices/unregister", DeviceController, :delete)

    post("/news/mark-as-read", NewsController, :mark_as_read)
  end

  # Anonymous routes.
  scope "/", StitchConnect.Web do
    pipe_through(:browser)

    scope "/invitations" do
      get("/error", InvitationController, :error)

      scope "/accept" do
        get("/:token", InvitationController, :accept)
        get("/:token/:step", InvitationController, :accept)
      end
    end
  end

  # Authenticated routes.
  scope "/", StitchConnect.Web do
    pipe_through(:browser_authenticate)

    get("/rooms/:slug", GroupController, :index)
    get("/messages/:id/download", MessageController, :download)

    get("/exports/:id/download", ExportController, :download)
  end

  # Catch any remaining patient routes

  scope "/patient", StitchEngage.Web, as: :patient do
    get("/*path", PatientController, :index)
  end

  # =========================
  #   STITCH ENGAGE ROUTES
  # =========================

  scope "/api/v1", StitchEngage.Web.Api.V1, as: :api_v1 do
    pipe_through(:authenticated_api)

    get("/inboxes/default", InboxController, :default)
    put("/inboxes/:id", InboxController, :update)

    get("/inboxes/:inbox_id/conversations", ConversationController, :index)
    post("/inboxes/:inbox_id/conversations", ConversationController, :create)
    get("/conversations/:id", ConversationController, :show)
    put("/conversations/:id/open", ConversationController, :open)
    put("/conversations/:id/close", ConversationController, :close)

    get("/conversations/:conversation_id/messages", ConversationMessageController, :index)
    post("/conversations/:conversation_id/messages", ConversationMessageController, :create)

    get("/conversation_messages/:id", ConversationMessageController, :show)
    put("/conversation_messages/:id", ConversationMessageController, :update)
    delete("/conversation_messages/:id", ConversationMessageController, :delete)

    put(
      "/conversation_messages/:id/delete_link_preview",
      ConversationMessageController,
      :delete_message_link_preview
    )

    put(
      "/conversation_messages/:id/toggle_reaction",
      ConversationMessageController,
      :toggle_reaction
    )

    post(
      "/conversations/:conversation_id/mark_as_read",
      ConversationMessageController,
      :mark_as_read
    )

    post(
      "/conversations/:conversation_id/mark_as_unread",
      ConversationMessageController,
      :mark_as_unread
    )

    # Expected future Engage routes:
    # get("/conversation_messages/:id/download", ConversationMessageController, :download)
    # get("/conversations/:conversation_id/feed_surrounding", ConversationMessageController, :feed_surrounding)
    # post("/conversation_messages/search", ConversationMessageController, :search)
  end

  # ==============
  #   DOC ROUTES
  # ==============

  scope "/api/docs" do
    forward(
      "/",
      PhoenixSwagger.Plug.SwaggerUI,
      otp_app: :stitch_web,
      swagger_file: "carespace-swagger.json"
    )
  end

  def swagger_info do
    %{
      info: %{
        version: "1.0",
        title: "Stitch"
      }
    }
  end
end
