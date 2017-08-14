defmodule StitchConnect.Web.GroupChannel do
  use Phoenix.Channel
  alias StitchConnect.Web.Presence

  def join("group:lobby", _, socket) do
    send self(), :after_join
    {:ok, socket}
  end

  # def join("groups:" <> group_id, _params, socket) do
  #   case Stitch.Group.Authorization.can_join?(group_id, socket.assigns.current_user.id) do
  #     false ->
  #       {:error, %{reason: "unauthorized"}}
  #     group ->
  #       {:ok, assign(socket, :group, group)}
  #   end
  # end

  def handle_info(:after_join, socket) do
    user = Stitch.UserQueries.get_by_id(socket.assigns.current_user_id)
    push socket, "presence_state", Presence.list(socket)
    {:ok, _} = Presence.track(socket, socket.assigns.current_user_id, %{
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

  def terminate(_reason, socket) do
    {:ok, socket}
  end
end