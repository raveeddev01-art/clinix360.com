defmodule Stitch.GroupQueries do
  @moduledoc """
  Module in charge of all group related queries.
  """

  alias Stitch.{Repo, Team, Group}
  alias Stitch.Accounts.User
  import Ecto.Query

  @doc """
  Returns a list of public groups for the user's team, and
  also teams he can join if he wants to.
  """
  def available_teams(user_id) do
    user = Repo.get(User, user_id)
    team = Repo.get(Team, user.team_id)

    query =
      from g in Group,
      where: g.team_id == ^team.id,
      where: g.public == ^true

    Repo.all(query)
  end
end