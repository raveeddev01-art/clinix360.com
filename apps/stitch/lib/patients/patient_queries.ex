defmodule Stitch.PatientQueries do
  @moduledoc """
  Queries used for Patient and TeamPatient related logic.
  """

  import Ecto.Query
  alias Stitch.{Repo, Patient, TeamPatient}

  @doc """
  Given a team id (and optional subquery), return a list of team patients with preloaded patients.
  """
  @spec team_patients_for_team_id(Ecto.Query.t(), number) :: list(TeamPatient.t())
  def team_patients_for_team_id(query \\ TeamPatient, team_id) when is_number(team_id) do
    query
    |> join(:inner, [tp], p in Patient, p.id == tp.patient_id)
    |> where([tp, p], tp.team_id == ^team_id)
    |> preload(:patient)
    |> Repo.all()
  end

  @doc """
  Given a team id (and optional subquery), return a list of patients for a team.
  """
  @spec patients_for_team_id(Ecto.Query.t(), number) :: list(Patient.t())
  def patients_for_team_id(query \\ Patient, team_id) when is_number(team_id) do
    query
    |> join(:inner, [p], tp in TeamPatient, tp.patient_id == p.id and tp.team_id == ^team_id)
    |> Repo.all()
  end
end
