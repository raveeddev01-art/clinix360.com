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
  def available_groups(user_id) do
    user = Repo.get(User, user_id)
    team = Repo.get(Team, user.team_id)

    public_groups =
      from g in Group,
      where: g.team_id == ^team.id,
      where: g.public == ^true,
      preload: [:users],
      select: g

    participating_groups =
      from g in Group,
      join: gu in GroupUser,
      where: gu.group_id == g.id,
      where: gu.user_id == ^user.id,
      preload: [:users],
      select: g

    public_groups = Repo.all(public_groups)
    participating_groups = Repo.all(participating_groups)
    result_groups = public_groups ++ participating_groups

    result_groups
    |> Enum.uniq
  end

  @doc """
  Returns a list of visible groups for the user given
  a search term.
  """
  def search(user_id, term) do
    []
  end
end