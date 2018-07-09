defmodule Stitch.Engage.InboxAuthorization do
  @moduledoc """
  Authorization module for inbox related logic.
  """

  alias Stitch.{
    TeamAuthorization,
    Accounts.User,
    Patient
  }

  @doc """
  Given an inbox and user or patient. Check if user or patient can see an inbox.

  If user, ensure on team and not guest.
  If patient, ensure on team.
  """
  @spec can_view?(Inbox.t(), User.t() | Patient.t()) :: boolean
  def can_view?(inbox, %User{} = current_user) do
    is_full_team_member?(inbox.team_id, current_user)
  end

  def can_view?(inbox, %Patient{} = patient) do
    inbox.team_id == patient.team_id
  end

  @doc """
  Given an inbox and user. Check if user can update inbox.

  Currently, ensures user is on team and an admin.
  """
  @spec can_update?(Inbox.t(), User.t()) :: boolean
  def can_update?(inbox, current_user) do
    is_team_admin?(inbox.team_id, current_user)
  end

  # ===========
  #   PRIVATE
  # ===========

  defp is_team_admin?(team_id, user) do
    TeamAuthorization.user_is_member?(team_id, user.id) && "admin" in user.roles
  end

  defp is_full_team_member?(team_id, user) do
    TeamAuthorization.user_is_member?(team_id, user.id) && !User.guest?(user)
  end
end
