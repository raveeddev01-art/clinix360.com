defmodule Stitch.GroupQueries do
  @moduledoc """
  Module in charge of all group related queries.
  """

  alias Stitch.{Repo, Team, Group, GroupUser}
  alias Stitch.Accounts.User
  import Ecto.Query

  @doc """
  Returns a list of public groups for the user's team, and
  also teams he's been invited to participate in.
  """
  def available_teams(user_id) do
    user = Repo.get(User, user_id)
    team = Repo.get(Team, user.team_id)

    public_teams =
      from g in Group,
      where: g.team_id == ^team.id,
      where: g.public == ^true

    participating_teams =
      from gu in GroupUser,
      join: g in Group,
      where: gu.group_id == g.id,
      where: gu.user_id == ^user.id,
      select: g

    Repo.all(public_teams)
  end

  @doc """
  Returns a list of visible groups for the user given
  a search term.
  """
  def search(user_id, term) do
    []
  end
end