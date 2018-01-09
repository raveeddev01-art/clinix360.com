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

  def can_send_invites?(_, %Team{open_invitations_enabled: true}), do: true
  def can_send_invites?(%User{roles: roles}, _), do: "admin" in roles

  def can_set_avatar?(%User{id: my_id, roles: roles}, affected_user_id) do
    if "admin" in roles, do: true, else: my_id == affected_user_id
  end
end
