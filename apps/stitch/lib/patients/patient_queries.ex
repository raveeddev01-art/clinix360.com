defmodule Stitch.PatientQueries do
  import Ecto.Query
  alias Stitch.{Repo, Patient, TeamPatient}

  def team_patients_for_team_id(query \\ TeamPatient, team_id) when is_number(team_id) do
    query
    |> join(:inner, [tp], p in Patient, p.id == tp.patient_id)
    |> where([tp, p], tp.team_id == ^team_id)
    |> preload(:patient)
    |> Repo.all()
  end

  def patients_for_team_id(query \\ Patient, team_id) when is_number(team_id) do
    query
    |> join(:inner, [p], tp in TeamPatient, tp.patient_id == p.id and tp.team_id == ^team_id)
    |> Repo.all()
  end
end
