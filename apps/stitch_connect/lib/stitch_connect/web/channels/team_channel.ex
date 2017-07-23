defmodule StitchConnect.Web.TeamChannel do
  use Phoenix.Channel
  alias StitchConnect.Web.Presence

  def join("team:lobby:" <> team_id, _, socket) do
    team_id = String.to_integer(team_id)
    case Stitch.Team.Authorization.user_is_member?(team_id, socket.assigns.current_user_id) do
      false ->
        {:error, %{reason: "Unauthorized"}}
      team ->
        socket = assign(socket, :team, team)
        send self(), :after_join
        {:ok, socket}
    end
  end

  def handle_info(:after_join, socket) do
    user = Stitch.UserQueries.get_by_id(socket.assigns.current_user_id)
    push socket, "presence_state", Presence.list(socket)
    {:ok, _} = Presence.track(socket, socket.assigns.current_user_id, %{
      online_at: inspect(System.system_time(:seconds)),
      id: user.id,
      fullname: user.fullname
    })
    {:noreply, socket}
  end

  def terminate(_reason, socket) do
    {:ok, socket}
  end
end