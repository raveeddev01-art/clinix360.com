defmodule Stitch.PatientAuthorization do
  @moduledoc """
  Authorization module for patient and team_patient related logic.
  """

  alias Stitch.{TeamAuthorization, Accounts.User}

  @doc """
  Given a team_id and user. Check if user can create a patient.
  """
  @spec can_create_as_provider?(number, User.t()) :: boolean
  def can_create_as_provider?(team_id, current_user) do
    is_full_team_member?(team_id, current_user)
  end

  @doc """
  Given a team_patient_id and user. Check if user can update the team patient.
  """
  @spec can_update_as_provider?(number, User.t()) :: boolean
  def can_update_as_provider?(team_patient_id, current_user) do
    team_patient = Stitch.PatientQueries.get_team_patient(team_patient_id)
    team_patient && is_full_team_member?(team_patient.team_id, current_user)
  end

  defp is_full_team_member?(team_id, user) do
    TeamAuthorization.user_is_member?(team_id, user.id) && !User.guest?(user)
  end
end
