defmodule Stitch.PatientQueries do
  @moduledoc """
  Queries used for Patient related logic.
  """

  import Ecto.Query
  alias Stitch.{Repo, Patient}

  @doc """
  Given a team id (and optional subquery), return a list of patients for a team.
  """
  @spec patients_for_team_id(Ecto.Query.t(), number | binary) :: list(Patient.t())
  def patients_for_team_id(query \\ Patient, team_id) do
    query
    |> where(team_id: ^team_id)
    |> Repo.all()
  end

  @doc """
  Given a patient id, return the patient.
  """
  @spec get_patient(number | binary) :: Patient.t() | nil
  def get_patient(patient_id) do
    Patient |> where(id: ^patient_id) |> Repo.one()
  end
end
