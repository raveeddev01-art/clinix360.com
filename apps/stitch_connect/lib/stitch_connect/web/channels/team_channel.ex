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
      current_group: nil,
      session_id: socket.assigns.session_id,
      online_at: inspect(System.system_time(:seconds)),
      status_updated_at: inspect(System.system_time(:seconds)),
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
    update_session_meta(socket, %{
      status: status,
      status_updated_at: inspect(System.system_time(:seconds))
    })
    push socket, "presence_state", Presence.list(socket)
    {:noreply, socket}
  end

  def handle_in("current_group_update", %{"current_group" => current_group}, socket) do
    update_session_meta(socket, %{current_group: current_group})
    {:noreply, socket}
  end

  def terminate(_reason, socket) do
    {:ok, socket}
  end

  defp update_session_meta(socket, updated_meta) do
    user = socket.assigns.current_user

    with presence_list <- Presence.list(socket),
      {:ok, %{metas: metas}} <- Map.fetch(presence_list, to_string(user.id)),
      previous_meta when not is_nil(previous_meta) <- Enum.find(metas, & &1.session_id == socket.assigns.session_id),
      updated_meta <- Map.merge(previous_meta, updated_meta)
    do
      Presence.update(socket, user.id, updated_meta)
    end
  end
end
