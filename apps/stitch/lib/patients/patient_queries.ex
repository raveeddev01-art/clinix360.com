defmodule Stitch.PatientQueries do
  @moduledoc """
  Queries used for Patient related logic.
  """

  import Ecto.Query

  alias Stitch.{
    Repo,
    Patient
  }

  @doc """
  Given a team id (and optional subquery), return a list of team patients with preloaded patients.
  """
  @spec get_by_token(binary) :: Patient.t() | nil
  def get_by_token(token) do
    Patient
    |> where(token: ^token)
    |> limit(1)
    |> preload(:team)
    |> Repo.one()
  end

  @doc """
  Given an invite_token (for Invitation, not a patient.token), find
  the patent associated with that invitation.
  """
  def get_by_invite_token(invite_token) do
    Patient
    |> join(:inner, [p], i in assoc(p, :invitation))
    |> where([p, i], i.invite_token == ^invite_token)
    |> Repo.one()
  end

  @doc """
  Given a team id (and optional subquery), return a list of patients for a team.
  """
  @spec patients_for_team_id(Ecto.Query.t(), number | binary) :: list(Patient.t())
  def patients_for_team_id(query \\ Patient, team_id) do
    query
    |> where(team_id: ^team_id)
    |> Repo.all()
  end

  @spec for_team_and_email(integer, binary) :: Patient.t()
  def for_team_and_email(team_id, email) do
    Patient
    |> where(team_id: ^team_id)
    |> where(email: ^email)
    |> Repo.one()
  end

  @doc """
  Given a patient id, return the patient.
  """
  @spec get_patient(number | binary) :: Patient.t() | nil
  def get_patient(patient_id) do
    Patient |> where(id: ^patient_id) |> Repo.one()
  end
end
