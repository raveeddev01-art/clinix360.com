defmodule StitchConnect.Web.RoomChannel do
  use Phoenix.Channel
  alias StitchConnect.Web.Presence

  def join("room:lobby", _, socket) do
    send self(), :after_join
    {:ok, socket}
  end

  # def join("rooms:" <> room_id, _params, socket) do
  #   case Stitch.Room.Authorization.can_join?(room_id, socket.assigns.current_user.id) do
  #     false ->
  #       {:error, %{reason: "unauthorized"}}
  #     room ->
  #       {:ok, assign(socket, :room, room)}
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
      username: user.username
    })
    {:noreply, socket}
  end

  def terminate(_reason, socket) do
    {:ok, socket}
  end
end