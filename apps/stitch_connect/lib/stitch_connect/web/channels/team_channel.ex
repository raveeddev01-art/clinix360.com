defmodule StitchConnect.Web.TeamChannel do
  use StitchConnect.Web, :channel
  use Appsignal.Instrumentation.Decorators
  alias StitchConnect.Web.Presence
  alias StitchConnect.Web.Api.V1.UserView
  @endpoint StitchConnect.Web.Endpoint

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
      inactive: false,
      became_away: false,
      lockout_timer_expired: false,
      session_id: socket.assigns.session_id,
      connection_id: socket.assigns.connection_id,
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

  @decorate channel_action()
  def handle_in("became_inactive", _params, socket) do
    update_connection_meta(socket, %{inactive: true})
    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("became_away", _params, socket) do
    update_connection_meta(socket, %{became_away: true})
    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("lockout_timer_expired", _params, socket) do
    update_connection_meta(socket, %{lockout_timer_expired: true})
    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("became_active", _params, socket) do
    update_connection_meta(socket, %{
      inactive: false,
      became_away: false,
      lockout_timer_expired: false,
    })
    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("locked", _params, socket) do
    broadcast_from(socket, "locked", %{sessionId: socket.assigns.session_id})
    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("unlocked", _params, socket) do
    broadcast_from(socket, "unlocked", %{sessionId: socket.assigns.session_id})
    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("get_lockout_settings", _params, socket) do
    team = Stitch.TeamQueries.get_by_id(socket.assigns.team_id)

    {:reply, {:ok, %{
      security_lockout_enabled: team.security_lockout,
      seconds_to_lockout: team.seconds_to_lockout
    }}, socket}
  end

  def broadcast_user_joined(%Stitch.Team{} = team, %Stitch.Accounts.User{} = user) do
    user_json = UserView.user_json(user)
    @endpoint.broadcast("team:lobby:#{team.id}", "user_joined", user_json)
  end

  def broadcast_team_rename(%Stitch.Team{} = team) do
    @endpoint.broadcast("team:lobby:#{team.id}", "team_renamed", %{
      name: team.name,
      slug: team.slug,
    })
  end

  def broadcast_user_info(%Stitch.Team{} = team, %Stitch.Accounts.User{} = user) do
    user_json = UserView.user_json(user)
    @endpoint.broadcast("team:lobby:#{team.id}", "user_info", user_json)
  end

  def broadcast_group_public_status(%Stitch.Team{} = team, %Stitch.Group{} = group) do
    @endpoint.broadcast("team:lobby:#{team.id}", "group_public_status", %{group_id: group.id, public: group.public})
  end

  def broadcast_deactivated(team, user_id) do
    @endpoint.broadcast("team:lobby:#{team.id}", "user_deactivated", %{user_id: user_id})
  end

  def broadcast_activated(team, user_id) do
    @endpoint.broadcast("team:lobby:#{team.id}", "user_activated", %{user_id: user_id})
  end

  def broadcast_team_deleted(%Stitch.Team{} = team) do
    @endpoint.broadcast("team:lobby:#{team.id}", "team_deleted", %{})
  end

  def terminate(_reason, socket) do
    {:ok, socket}
  end

  defp update_connection_meta(socket, updated_meta) do
    user = socket.assigns.current_user

    with presence_list <- Presence.list(socket),
      {:ok, %{metas: metas}} <- Map.fetch(presence_list, to_string(user.id)),
      previous_meta when not is_nil(previous_meta) <- Enum.find(metas, & &1.connection_id == socket.assigns.connection_id),
      updated_meta <- Map.merge(previous_meta, updated_meta)
    do
      Presence.update(socket, user.id, updated_meta)
    end
  end
end
