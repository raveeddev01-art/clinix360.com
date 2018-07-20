defmodule Stitch.PatientAuthorization do
  @moduledoc """
  Authorization module for patient related logic.
  """

  alias Stitch.{TeamAuthorization, Accounts.User, Patient}

  @doc """
  Given a team_id and user. Check if user can create a patient.
  """
  @spec can_create_as_provider?(number, User.t()) :: boolean
  def can_create_as_provider?(team_id, current_user) do
    is_full_team_member?(team_id, current_user)
  end

  @doc """
  Given a patient_id and user. Check if user can update the patient.
  """
  @spec can_update_as_provider?(number, User.t()) :: boolean
  def can_update_as_provider?(patient_id, current_user) do
    patient = Stitch.PatientQueries.get_patient(patient_id)
    patient && is_full_team_member?(patient.team_id, current_user)
  end

  defp is_full_team_member?(team_id, user) do
    TeamAuthorization.user_is_member?(team_id, user.id) && !User.guest?(user)
  end

  @doc """
  Given a user and patient, check if user can view the patient.
  """
  @spec can_view_patient_as_provider?(User.t(), Patient.t()) :: boolean
  def can_view_patient_as_provider?(%User{} = current_user, %Patient{} = patient) do
    is_full_team_member?(patient.team_id, current_user)
  end
end
