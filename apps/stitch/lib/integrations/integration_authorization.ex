defmodule Stitch.IntegrationAuthorization do
  alias Stitch.Repo

  def can_delete?(config, current_user) do
    config = Repo.preload(config, :group)

    config.group.team_id == current_user.team_id && Enum.member?(current_user.roles, "admin")
  end
end
