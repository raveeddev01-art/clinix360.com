defmodule Stitch.TeamQueries do
  import Ecto.Query
  alias Stitch.{Repo, Team}

  def get_by_id(id) do
    Repo.get(Team, id)
  end

  def get_by_slug(slug) when byte_size(slug) > 0 do
    Repo.get_by(Team, slug: slug)
  end
  def get_by_slug(_), do: nil
end
