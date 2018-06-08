defmodule Stitch.PatientQueriesTest do
  use Stitch.DataCase, async: true
  alias Stitch.PatientQueries

  describe "Stitch.PatientQueries.team_patients_for_team_id/2" do
    setup do
      team = insert(:team)
      patient = insert(:patient)
      {:ok, team: team, patient: patient}
    end

    test "returns team_patients for a team", %{team: team, patient: patient} do
      team_patient = insert(:team_patient, %{team: team, patient: patient})
      [query_res_patient] = Stitch.PatientQueries.team_patients_for_team_id(team.id)

      assert query_res_patient.id == team_patient.id
    end

    test "includes the patient on the team_patients", %{team: team, patient: patient} do
      team = insert(:team)
      patient = insert(:patient)
      team_patient = insert(:team_patient, %{team: team, patient: patient})

      [%{patient: query_res_patient}] = Stitch.PatientQueries.team_patients_for_team_id(team.id)

      assert query_res_patient == patient
    end

    test "does not return team_patients for other teams", %{team: team, patient: patient} do
      team = insert(:team)
      patient = insert(:patient)
      team_patient = insert(:team_patient, %{team: insert(:team), patient: patient})

      query_res = Stitch.PatientQueries.team_patients_for_team_id(team.id)

      assert query_res == []
    end
  end

  describe "Stitch.PatientQueries.patients_for_team_id/2" do
    setup do
      team = insert(:team)
      patient = insert(:patient)
      {:ok, team: team, patient: patient}
    end

    test "returns a team's patients", %{team: team, patient: patient} do
      team_patient = insert(:team_patient, %{team: team, patient: patient})
      query_res = Stitch.PatientQueries.patients_for_team_id(team.id)

      assert query_res == [patient]
    end

    test "does not return patients on other team", %{team: team, patient: patient} do
      team_patient = insert(:team_patient, %{team: insert(:team), patient: patient})
      query_res = Stitch.PatientQueries.patients_for_team_id(team.id)

      assert query_res == []
    end
  end
end
