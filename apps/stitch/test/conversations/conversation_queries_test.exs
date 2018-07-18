defmodule Stitch.Engage.ConversationQueriesTest do
  use Stitch.DataCase, async: true

  describe "Stitch.Engage.ConversationQueriesTest.with_patient/2" do
    test "returns latest conversation_message for each conversation with patient" do
      team = insert(:team)
      inbox_a = insert(:inbox, team: team)
      inbox_b = insert(:inbox, team: team, name: "Medication", is_default: false)
      provider = insert(:user, team: team)
      patient_a = insert(:patient, team: team)
      patient_b = insert(:patient, team: team)

      conversation_with_patient_a = insert(:conversation, inbox: inbox_a)
      insert(:conversation_patient, patient: patient_a, conversation: conversation_with_patient_a)

      _ =
        insert(
          :conversation_message,
          conversation: conversation_with_patient_a,
          provider: provider
        )

      latest_1 =
        insert(
          :patient_conversation_message,
          conversation: conversation_with_patient_a,
          patient: patient_a
        )

      conversation_with_patient_a_and_b = insert(:conversation, inbox: inbox_b)

      insert(
        :conversation_patient,
        patient: patient_a,
        conversation: conversation_with_patient_a_and_b
      )

      insert(
        :conversation_patient,
        patient: patient_b,
        conversation: conversation_with_patient_a_and_b
      )

      _ =
        insert(
          :patient_conversation_message,
          conversation: conversation_with_patient_a_and_b,
          patient: patient_a
        )

      _ =
        insert(
          :patient_conversation_message,
          conversation: conversation_with_patient_a_and_b,
          patient: patient_b
        )

      latest_2 =
        insert(
          :conversation_message,
          conversation: conversation_with_patient_a_and_b,
          provider: provider
        )

      conversation_with_patient_b = insert(:conversation, inbox: inbox_a)
      insert(:conversation_patient, patient: patient_b, conversation: conversation_with_patient_b)

      _ =
        insert(
          :conversation_message,
          conversation: conversation_with_patient_b,
          provider: provider
        )

      _ =
        insert(
          :patient_conversation_message,
          conversation: conversation_with_patient_b,
          patient: patient_b
        )

      latest_conversation_messages =
        Stitch.Engage.ConversationQueries.with_patient(patient_a, %{})

      assert_conversation_messages(latest_conversation_messages, [latest_1, latest_2])
    end
  end

  # This is to avoid mismatch due to not preloaded associations
  def assert_conversation_messages(list_a, list_b) do
    a = list_a |> Enum.map(&struct(&1.__struct__, %{id: &1.id}))
    b = list_b |> Enum.map(&struct(&1.__struct__, %{id: &1.id}))
    assert a == b
  end
end
