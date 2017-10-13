defmodule Stitch.TeamQueries do
  import Ecto.Query
  alias Stitch.Accounts.User
  alias Stitch.{Repo, Team}

  def get_by_id(id) do
    Repo.get(Team, id)
  end

  def get_by_slug(slug) when byte_size(slug) > 0 do
    Repo.get_by(Team, slug: slug)
  end
  def get_by_slug(_), do: nil

  @doc """
  Returns a list of currently active/onboarded users for a team.


  ## Examples

      iex> list_active_users(%Team{...})
      [%User{...}, %User{...}, ...]

  """
  @spec list_active_users(Team.t) :: [User.t]
  def list_active_users(%Team{id: team_id}) do
    query =
      from u in User,
      where: u.onboarded == true,
      where: u.disabled == false,
      where: u.team_id == ^team_id
    Repo.all(query)
  end
end
