defmodule Stitch.Web.PatientSocket do
  use Stitch.Web, :socket

  ## Channels
  channel("team:patient:*", Stitch.Web.TeamChannel)
  channel("events:patient:*", Stitch.Web.EventsChannel)
  channel("conversation:*", Stitch.Web.ConversationChannel)

  def connect(%{"authenticationToken" => token} = params, socket) do
    channel_action(__MODULE__, :connect, socket, fn ->
      # Handle concurrent browser tests
      socket = Stitch.Web.ChannelSandbox.configure_channel_sandbox(params, socket)

      case Stitch.PatientQueries.get_active_by_token(token) do
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
