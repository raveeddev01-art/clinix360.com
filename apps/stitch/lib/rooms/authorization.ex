defmodule Stitch.Room.Authorization do
  @moduledoc """
  Onboarding module used to onboard new teams to the Stitch
  platform.
  """

  alias Stitch.{Repo, User, Room}

  def can_join?(room_id, user_id) do
    room = Repo.get(Room, room_id)
    user = Repo.get(User, user_id)
    case room.team_id == user.team_id do
      true ->
        room
      _ ->
        false
    end
  end
end
