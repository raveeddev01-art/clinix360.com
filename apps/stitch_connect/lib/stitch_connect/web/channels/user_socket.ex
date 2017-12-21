defmodule StitchConnect.Web.UserSocket do
  use Phoenix.Socket

  ## Channels
  channel "groups:*", StitchConnect.Web.GroupChannel
  channel "team:lobby:*", StitchConnect.Web.TeamChannel
  channel "events:*", StitchConnect.Web.EventsChannel

  ## Transports
  transport :websocket, Phoenix.Transports.WebSocket,
    timeout: 45_000,
    check_origin: ["//*.teamstitchapp.com", "//*.teamstitch.com", "//*.#{Application.fetch_env!(:stitch_connect, :application_host)}"]

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
  @refactor """
  Consider only storing the current_user.id in the socket assigns.
  This will greatly reduce memory usage per client and is likely all you
  need to store. Information can be later fetched from the ID as needed.
  It also avoids the issue of holding onto stale data for long-lived
  connections.
  """
  def connect(%{"authenticationToken" => token} = params, socket) do
    case Stitch.User.Authentication.user_for_token(token) do
      nil ->
        :error
      user ->
        socket = socket
        |> assign(:current_user, user)
        |> assign(:team_id, user.team_id)
        |> assign(:session_id, params["sessionId"])
        |> assign(:connection_id, Stitch.Rand.token(8))
        |> assign(:application_version, params["applicationVersion"])
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
