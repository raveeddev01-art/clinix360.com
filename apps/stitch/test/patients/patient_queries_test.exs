defmodule Stitch.PatientQueriesTest do
  use Stitch.DataCase, async: true
  alias Stitch.PatientQueries

  describe "Stitch.PatientQueries.patients_for_team_id/2" do
    test "returns patients for a team" do
      team = insert(:team)
      patient = insert(:patient, %{team: team})
      [query_res_patient] = PatientQueries.patients_for_team_id(team.id)

      assert query_res_patient.id == patient.id
    end

    test "does not return patients for other teams" do
      team = insert(:team)
      _patient = insert(:patient, %{team: insert(:team)})
      query_res = PatientQueries.patients_for_team_id(team.id)

      assert query_res == []
    end
  end

  describe "Stitch.PatientQueries unread counts" do
    test "returns correct unread counts for a patient" do
      patient = insert(:patient, %{})
      insert(:conversation_patient, %{patient: patient, unread_messages_count: 0})
      insert(:conversation_patient, %{patient: patient, unread_messages_count: 1})
      insert(:conversation_patient, %{patient: patient, unread_messages_count: 3})

      unread_messages_count = PatientQueries.unread_conversation_messages_count(patient.id)
      assert unread_messages_count == 4

      unread_conversations_count = PatientQueries.unread_conversations_count(patient.id)
      assert unread_conversations_count == 2
    end
  end
end
