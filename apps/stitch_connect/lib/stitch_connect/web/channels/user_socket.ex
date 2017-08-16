defmodule StitchConnect.Web.UserSocket do
  use Phoenix.Socket

  ## Channels
  channel "groups:*", StitchConnect.Web.GroupChannel
  channel "team:lobby:*", StitchConnect.Web.TeamChannel
  channel "notifications:*", StitchConnect.Web.NotificationsChannel

  ## Transports
  transport :websocket, Phoenix.Transports.WebSocket,
    timeout: 45_000,
    check_origin: ["//*.teamstitchapp.com", "//*.localhost:4443"]

  # Socket params are passed from the client and can
  # be used to verify and authenticate a user. After
  # verification, you can put default assigns into
  # the socket that will be set for all channels, ie
  #
  #     {:ok, assign(socket, :user_id, verified_user_id)}
  #
  # To deny connection, return `:error`.
  #
  # See `Phoenix.Token` documentation for examples in
  # performing token verification on connect.
  def connect(%{"authenticationToken" => token}, socket) do
    case Stitch.User.Authentication.user_for_token(token) do
      nil ->
        :error
      user ->
        socket = socket |> assign(:current_user, user) |> assign(:team_id, user.team_id)
        {:ok, socket}
    end
  end

  def connect(_params, _socket), do: :error

  # Socket id's are topics that allow you to identify all sockets for a given user:
  #
  #     def id(socket), do: "user_socket:#{socket.assigns.user_id}"
  #
  # Would allow you to broadcast a "disconnect" event and terminate
  # all active sockets and channels for a given user:
  #
  #     StitchConnect.Web.Endpoint.broadcast("user_socket:#{user.id}", "disconnect", %{})
  #
  # Returning `nil` makes this socket anonymous.
  def id(socket), do: "users_socket:#{socket.assigns.current_user.id}"
end
