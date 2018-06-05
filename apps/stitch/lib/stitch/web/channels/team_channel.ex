defmodule Stitch.Web.TeamChannel do
  use Stitch.Web, :channel
  alias Stitch.Accounts.User
  alias Stitch.{UserQueries, GroupQueries}
  alias Stitch.Web.Presence
  alias StitchConnect.Web.Api.V1.{UserView, GroupView}
  alias Stitch.Accounts.ActivityTracker
  alias StitchConnect.Web.PushNotifications

  @endpoint Stitch.Web.Endpoint

  def join("team:lobby:" <> team_id, params, socket) do
    sync_timestamp = get_sync_users(params)
    fetch_users_and_groups? = get_fetch_users_and_groups(params)
    include_user_ids? = get_include_user_ids(params)

    team_id = String.to_integer(team_id)

    if team_id == socket.assigns.team_id do
      send(self(), :after_join)
      update_timezone(socket.assigns.current_user, params)

      if fetch_users_and_groups? do
        view = render_users_and_groups(socket.assigns, include_user_ids?, sync_timestamp)
        {:ok, view, assign(socket, :meta, %{})}
      else
        {:ok, assign(socket, :meta, %{})}
      end
    else
      {:error, %{message: "Unauthorized"}}
    end
  end

  defp get_sync_users(%{"syncUsersTimestamp" => timestamp}), do: timestamp
  defp get_sync_users(_params), do: nil

  defp get_fetch_users_and_groups(%{"fetchUsersAndGroups" => true}), do: true
  defp get_fetch_users_and_groups(_params), do: false

  defp get_include_user_ids(%{"includeUserIds" => false}), do: false
  defp get_include_user_ids(_params), do: true

  defp update_timezone(user, %{"timezone" => timezone}) do
    User.update_timezone(user, timezone)
  end

  defp update_timezone(_user, _timezone), do: nil

  defp render_users_and_groups(assigns, include_user_ids?, sync_users_timestamp) do
    users =
      if sync_users_timestamp do
        UserQueries.users_for_team_after(assigns.current_user.team_id, sync_users_timestamp)
      else
        UserQueries.users_for_team(assigns.current_user.team_id)
      end

    users_json = UserView.render("index.json", users: users)

    groups = GroupQueries.available_groups(assigns.current_user, include_user_ids?)

    groups_json =
      GroupView.render(
        "index.json",
        groups: groups,
        user_id: assigns.current_user.id,
        fetch_users: false,
        include_user_ids: include_user_ids?
      )

    %{users: users_json, groups: groups_json}
  end

  def handle_info(:after_join, socket) do
    user = socket.assigns.current_user
    push(socket, "presence_state", Presence.list(socket))

    meta = %{
      inactive: false,
      became_away: false,
      lockout_timer_expired: false,
      session_id: socket.assigns.session_id,
      connection_id: socket.assigns.connection_id,
      id: user.id
    }

    {:ok, _} = Presence.track(socket, user.id, meta)
    {:noreply, assign(socket, :meta, meta)}
  end

  @decorate channel_action()
  def handle_in("became_inactive", _params, socket) do
    socket =
      if socket.assigns.meta.inactive == true do
        socket
      else
        remove_activity(socket.assigns.current_user)
        socket = update_connection_meta(socket, %{inactive: true})
        push(socket, "presence_state", Presence.list(socket))
        socket
      end

    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("became_away", _params, socket) do
    socket =
      if socket.assigns.meta.became_away == true do
        socket
      else
        remove_activity(socket.assigns.current_user)
        socket = update_connection_meta(socket, %{became_away: true})
        push(socket, "presence_state", Presence.list(socket))
        socket
      end

    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("lockout_timer_expired", _params, socket) do
    {:noreply,
     update_connection_meta(socket, %{
       inactive: true,
       became_away: true,
       lockout_timer_expired: true
     })}
  end

  @decorate channel_action()
  def handle_in("became_active", _params, socket) do
    ActivityTracker.async_update_activity(socket.assigns.current_user)
    new_meta = %{inactive: false, became_away: false, lockout_timer_expired: false}

    current_meta =
      Map.take(socket.assigns.meta, [:inactive, :became_away, :lockout_timer_expired])

    socket =
      if new_meta == current_meta do
        socket
      else
        socket = update_connection_meta(socket, new_meta)
        push(socket, "presence_state", Presence.list(socket))
        socket
      end

    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("locked", _params, socket) do
    broadcast_from(socket, "locked", %{sessionId: socket.assigns.session_id})
    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("unlocked", _params, socket) do
    ActivityTracker.async_update_activity(socket.assigns.current_user)
    broadcast_from(socket, "unlocked", %{sessionId: socket.assigns.session_id})
    {:noreply, socket}
  end

  @decorate channel_action()
  def handle_in("get_lockout_settings", _params, socket) do
    team = Stitch.TeamQueries.get_by_id(socket.assigns.team_id)

    {:reply,
     {:ok,
      %{
        security_lockout_enabled: team.security_lockout,
        seconds_to_lockout: team.seconds_to_lockout
      }}, socket}
  end

  @spec remove_activity(User.t()) :: {:ok, pid} | nil
  def remove_activity(%User{} = user) do
    with {:ok, message_ids} <- ActivityTracker.remove_activity(user) do
      Stitch.Task.start(fn ->
        PushNotifications.notify_user(user, message_ids)
      end)
    else
      {:error, _} -> nil
    end
  end

  def broadcast_user_joined(team_id, %Stitch.Accounts.User{} = user) when is_number(team_id) do
    user_json = UserView.user_json(user)
    @endpoint.broadcast("team:lobby:#{team_id}", "user_joined", user_json)
  end

  def broadcast_user_joined(%Stitch.Team{} = team, %Stitch.Accounts.User{} = user) do
    broadcast_user_joined(team.id, user)
  end

  def broadcast_conceal_toggled(%Stitch.Team{} = team) do
    @endpoint.broadcast("team:lobby:#{team.id}", "conceal_switch_toggled", %{
      conceal_enabled: team.conceal_enabled
    })
  end

  def broadcast_team_rename(%Stitch.Team{} = team) do
    @endpoint.broadcast("team:lobby:#{team.id}", "team_renamed", %{
      name: team.name,
      slug: team.slug
    })
  end

  def broadcast_user_info(%Stitch.Team{} = team, users) when is_list(users) do
    for user <- users, do: broadcast_user_info(team, user)
  end

  def broadcast_user_info(%Stitch.Team{} = team, %Stitch.Accounts.User{} = user) do
    user_json = UserView.user_json(user)
    @endpoint.broadcast("team:lobby:#{team.id}", "user_info", user_json)
  end

  def broadcast_group_public_status(%Stitch.Team{} = team, %Stitch.Group{} = group) do
    @endpoint.broadcast("team:lobby:#{team.id}", "group_public_status", %{
      group_id: group.id,
      public: group.public
    })
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

  def broadcast_security_lockout_update(team) do
    @endpoint.broadcast("team:lobby:#{team.id}", "security_lockout_updated", %{
      security_lockout_enabled: team.security_lockout,
      seconds_to_lockout: team.seconds_to_lockout
    })
  end

  def terminate(_reason, socket) do
    remove_activity(socket.assigns.current_user)
    {:ok, socket}
  end

  defp update_connection_meta(socket, updated_meta) do
    merged_meta = Map.merge(socket.assigns.meta, updated_meta)
    activity_state = Map.take(merged_meta, [:inactive, :became_away])

    Presence.update(
      socket,
      socket.assigns.current_user.id,
      Map.merge(updated_meta, activity_state)
    )

    assign(socket, :meta, merged_meta)
  end
end
