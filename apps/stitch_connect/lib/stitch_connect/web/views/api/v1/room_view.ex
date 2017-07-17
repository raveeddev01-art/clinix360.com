defmodule StitchConnect.Web.Api.V1.RoomView do
  use StitchConnect.Web, :view

  def render("index.json", %{rooms: rooms}) do
    Enum.map(rooms, &room_json/1)
  end

  def room_json(room) do
    %{
      id: room.id,
      name: room.name
    }
  end
end