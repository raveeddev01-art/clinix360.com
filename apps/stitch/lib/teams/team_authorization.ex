defmodule Stitch.TeamAuthorization do
  @moduledoc """
  Authorization module for the Team model and related models.
  """

  alias Stitch.{Repo, Accounts.User, Team}

  def user_is_member?(team_id, user_id) do
    user = Repo.get(User, user_id)
    team = Repo.get(Team, user.team_id)
    team.id == team_id
  end

  def can_send_invites?(%User{team_id: team_id} = user, %Team{id: team_id, open_invitations_enabled: true}) do
    !User.guest?(user)
  end
  def can_send_invites?(%User{team_id: team_id, roles: roles}, %Team{id: team_id}) do
    "admin" in roles
  end
  def can_send_invites?(_, _), do: false
end
