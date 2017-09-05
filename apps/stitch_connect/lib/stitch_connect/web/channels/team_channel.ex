defmodule StitchConnect.Web.TeamChannel do
  use Phoenix.Channel
  alias StitchConnect.Web.Presence

  def join("team:lobby:" <> team_id, _, socket) do
    team_id = String.to_integer(team_id)
    if team_id == socket.assigns.team_id do
      send self(), :after_join
      {:ok, socket}
    else
      {:error, %{message: "Unauthorized"}}
    end
  end

  def handle_info(:after_join, socket) do
    user = socket.assigns.current_user
    push socket, "presence_state", Presence.list(socket)
    {:ok, _} = Presence.track(socket, user.id, %{
      status: "online",
      online_at: inspect(System.system_time(:seconds)),
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      roles: user.roles,
      disabled: user.disabled
    })
    {:noreply, socket}
  end

  def handle_in("status_update", %{"status" => status}, socket) when status in ["online", "away"] do
    user = socket.assigns.current_user
    {:ok, _} = Presence.update(socket, user.id, %{
      status: status,
      online_at: inspect(System.system_time(:seconds)),
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      roles: user.roles,
      disabled: user.disabled,
    })
    push socket, "presence_state", Presence.list(socket)
    {:noreply, socket}
  end

  def handle_in("current_group_update", %{"current_group" => current_group}, socket) do
    user = socket.assigns.current_user
    {:ok, _} = Presence.update(socket, user.id, %{
      status: "online",
      online_at: inspect(System.system_time(:seconds)),
      current_group: current_group,
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      roles: user.roles,
      disabled: user.disabled,
    })
    {:noreply, socket}
  end

  def terminate(_reason, socket) do
    {:ok, socket}
  end
end
