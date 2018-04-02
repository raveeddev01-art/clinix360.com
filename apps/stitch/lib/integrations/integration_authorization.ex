defmodule Stitch.IntegrationAuthorization do
  alias Stitch.Repo

  def can_disable?(user, integration) do
    integration.team_id == user.team_id && Enum.member?(user.roles, "admin")
  end

  def can_delete?(config, user) do
    config = Repo.preload(config, :group)

    config.group.team_id == user.team_id && Enum.member?(user.roles, "admin")
  end
end
