defmodule Stitch.Web.PatientSocket do
  use Phoenix.Socket
  import Appsignal.Phoenix.Channel, only: [channel_action: 4]

  ## Channels
  channel("team:patient:*", Stitch.Web.TeamChannel)
  channel("events:patient:*", Stitch.Web.EventsChannel)
  channel("conversation:*", Stitch.Web.ConversationChannel)

  ## Transports - DRY UP!
  transport(
    :websocket,
    Phoenix.Transports.WebSocket,
    timeout: 45_000,
    check_origin: [
      "//*.teamstitch-staging.com",
      "//*.teamstitchapp.com",
      "//*.teamstitch.com",
      "//*.#{Application.fetch_env!(:stitch_web, :application_host)}"
    ]
  )

  def connect(%{"authenticationToken" => token} = params, socket) do
    channel_action(__MODULE__, :connect, socket, fn ->
      # Handle concurrent browser tests
      socket = Stitch.Web.ChannelSandbox.configure_channel_sandbox(params, socket)

      # ensure patient is active here
      case Stitch.PatientQueries.get_by_token(token) do
        nil ->
          :error

        patient ->
          socket =
            socket
            |> assign(:patient, patient)
            |> assign(:team_id, patient.team_id)
            |> assign(:session_id, params["sessionId"])
            |> assign(:is_mobile, Map.get(params, "mobile", false))
            |> assign(:connection_id, Stitch.Rand.token(8))
            |> assign(:application_version, params["applicationVersion"])

          {:ok, socket}
      end
    end)
  end

  def connect(_params, _socket), do: :error
  def id(socket), do: "patients_socket:#{socket.assigns.patient.id}"
end
