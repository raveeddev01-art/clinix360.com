defmodule Stitch.TeamPatient.ChangesetsTest do
  use Stitch.DataCase, async: true
  alias Stitch.TeamPatient

  describe "Stitch.TeamPatient.changeset/2" do
    setup do
      valid_params = %{
        mrn: "12345",
        team_id: 1,
        patient_id: 1
      }

      {:ok, valid_params: valid_params}
    end

    test "valid when proper params given", %{valid_params: valid_params} do
      assert TeamPatient.changeset(%TeamPatient{}, valid_params).valid?
    end

    test "invalid without team", %{valid_params: valid_params} do
      without_team = Map.delete(valid_params, :team_id)
      refute TeamPatient.changeset(%TeamPatient{}, without_team).valid?
    end

    test "invalid without patient", %{valid_params: valid_params} do
      without_patient = Map.delete(valid_params, :patient_id)
      refute TeamPatient.changeset(%TeamPatient{}, without_patient).valid?
    end

    test "invalid without mrn", %{valid_params: valid_params} do
      without_mrn = Map.delete(valid_params, :mrn)
      refute TeamPatient.changeset(%TeamPatient{}, without_mrn).valid?
    end
  end
end
