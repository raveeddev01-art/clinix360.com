defmodule Stitch.TeamAuthorization do
  @moduledoc """
  Onboarding module used to onboard new teams to the Stitch
  platform.
  """

  alias Stitch.{Repo, Accounts.User, Team}

  def user_is_member?(team_id, user_id) do
    user = Repo.get(User, user_id)
    team = Repo.get(Team, user.team_id)
    team.id == team_id
  end
end
