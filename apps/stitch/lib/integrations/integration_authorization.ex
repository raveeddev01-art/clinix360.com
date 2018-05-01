defmodule Stitch.IntegrationAuthorization do
  def can_create?(user, group) do
    user.team_id == group.team_id && member_or_admin(user)
  end

  def can_disable?(user, integration) do
    integration.team_id == user.team_id && member_or_admin(user)
  end

  def can_edit?(user, integration) do
    user.team_id == integration.team_id && member_or_admin(user)
  end

  def can_delete?(user, integration) do
    user.team_id == integration.team_id && member_or_admin(user)
  end

  defp member_or_admin(user) do
    Enum.member?(user.roles, "member") || Enum.member?(user.roles, "admin")
  end
end
