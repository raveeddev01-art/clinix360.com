defmodule Stitch.RoomQueries do
  import Ecto.Query
  alias Stitch.{Repo, Team, Room}

  def rooms_for_team(team_id) when is_integer(team_id) do
    team = Repo.get(Team, team_id)
    rooms = Repo.all Ecto.assoc(team, :rooms)
    rooms
  end
  def rooms_for_team(_) do
    {:error, "team_id must be an integer"}
  end
end
