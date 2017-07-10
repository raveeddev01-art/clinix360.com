defmodule StitchConnect.Web.RoomChannel do
  use Phoenix.Channel

  def join("rooms:" <> room_id, _params, socket) do
    case Stitch.Room.Authorization.can_join?(room_id, socket.assigns.current_user.id) do
      false ->
        {:error, %{reason: "unauthorized"}}
      room ->
        {:ok, assign(socket, :room, room)}
    end
  end

  def terminate(_reason, socket) do
    {:ok, socket}
  end
end