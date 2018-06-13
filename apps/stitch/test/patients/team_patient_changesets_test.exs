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

    test "invalid without mrn", %{valid_params: valid_params} do
      without_mrn = Map.delete(valid_params, :mrn)
      refute TeamPatient.changeset(%TeamPatient{}, without_mrn).valid?
    end
  end
end
