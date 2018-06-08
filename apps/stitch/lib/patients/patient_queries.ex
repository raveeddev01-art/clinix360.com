defmodule Stitch.PatientQueries do
  @moduledoc """
  Queries used for Patient and TeamPatient related logic.
  """

  import Ecto.Query
  alias Stitch.{Repo, Patient, TeamPatient}

  @doc """
  Given a team id (and optional subquery), return a list of team patients with preloaded patients.
  """
  @spec team_patients_for_team_id(Ecto.Query.t(), number | binary) :: list(TeamPatient.t())
  def team_patients_for_team_id(query \\ TeamPatient, team_id) do
    query
    |> join(:inner, [tp], p in Patient, p.id == tp.patient_id)
    |> where([tp, p], tp.team_id == ^team_id)
    |> preload(:patient)
    |> Repo.all()
  end

  @doc """
  Given a team id (and optional subquery), return a list of patients for a team.
  """
  @spec patients_for_team_id(Ecto.Query.t(), number | binary) :: list(Patient.t())
  def patients_for_team_id(query \\ Patient, team_id) do
    query
    |> join(:inner, [p], tp in TeamPatient, tp.patient_id == p.id and tp.team_id == ^team_id)
    |> Repo.all()
  end

  @doc """
  Given a team patient id, return the team patient with the patient preloaded.
  """
  @spec get_team_patient(number | binary) :: TeamPatient.t() | nil
  def get_team_patient(team_patient_id) do
    TeamPatient
    |> where(id: ^team_patient_id)
    |> preload(:patient)
    |> Repo.one()
  end

  @doc """
  Given an email. Returns a matching patient record.
  """
  @spec find_patient_by_email(binary) :: Patient.t() | nil
  def find_patient_by_email(email) do
    trimmed_email = String.trim(email)
    Patient |> where(email: ^trimmed_email) |> Repo.one()
  end
end
