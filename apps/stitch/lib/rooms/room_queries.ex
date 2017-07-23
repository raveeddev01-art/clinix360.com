defmodule Stitch.RoomQueries do
  import Ecto.Query
  alias Stitch.{Repo, Room}

  def rooms_for_team(team_id) when is_integer(team_id) do
    query = from r in Room,
            where: r.team_id == ^team_id
    Repo.all(query)
  end
  def rooms_for_team(_) do
    {:error, "team_id must be an integer"}
  end
end
