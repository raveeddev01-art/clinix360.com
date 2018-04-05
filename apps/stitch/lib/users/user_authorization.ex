defmodule Stitch.UserAuthorization do
  @moduledoc """
  Authorization module for the User model and related models.
  """

  alias Stitch.{Accounts.User}

  def can_update_user?(%User{id: user_id}, user_id), do: true
  def can_update_user?(%User{roles: roles, team_id: team_id}, user_id) do
    with %User{} = target_user <- Stitch.UserQueries.team_member_by_id(user_id, team_id) do
      "admin" in roles
    else
      _ -> false
    end
  end
end
