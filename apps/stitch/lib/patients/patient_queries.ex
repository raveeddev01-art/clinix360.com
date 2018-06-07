defmodule Stitch.PatientQueries do
  import Ecto.Query
  alias Stitch.{Repo, Patient, TeamPatient}

  def for_team(query \\ Patient, team_id) do
    query
    |> join(:inner, [p], tp in TeamPatient, tp.patient_id == p.id and tp.team_id == ^team_id)
    |> Repo.all()
  end
end
