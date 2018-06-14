defmodule Stitch.Engage.InboxAuthorization do
  @moduledoc """
  Authorization module for inbox related logic.
  """

  alias Stitch.{TeamAuthorization, Accounts.User}

  @doc """
  Given an inbox and user. Check if user can update inbox.
  """
  @spec can_update?(Inbox.t(), User.t()) :: boolean
  def can_update?(inbox, current_user) do
    is_team_admin?(inbox.team_id, current_user)
  end

  defp is_team_admin?(team_id, user) do
    TeamAuthorization.user_is_member?(team_id, user.id) && "admin" in user.roles
  end
end
