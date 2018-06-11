defmodule Stitch.Patient.ChangesetsTest do
  use Stitch.DataCase, async: true
  alias Stitch.Patient

  describe "Stitch.Patient.changeset/2" do
    setup do
      valid_params = %{
        first_name: "Nicolas",
        last_name: "Oudinot",
        email: "nico@teamstitch.com"
      }

      {:ok, valid_params: valid_params}
    end

    test "valid when proper params given", %{valid_params: valid_params} do
      assert Patient.changeset(%Patient{}, valid_params).valid?
    end

    test "invalid without first_name", %{valid_params: valid_params} do
      without_first = Map.delete(valid_params, :first_name)
      refute Patient.changeset(%Patient{}, without_first).valid?
    end

    test "invalid without last_name", %{valid_params: valid_params} do
      without_last = Map.delete(valid_params, :last_name)
      refute Patient.changeset(%Patient{}, without_last).valid?
    end

    test "invalid without email", %{valid_params: valid_params} do
      without_email = Map.delete(valid_params, :email)
      refute Patient.changeset(%Patient{}, without_email).valid?
    end

    test "invalid with bad email", %{valid_params: valid_params} do
      bad_email = Map.put(valid_params, :email, "not-an-email-string")
      refute Patient.changeset(%Patient{}, bad_email).valid?
    end

    test "trims whitespace from email", %{valid_params: valid_params} do
      with_ws_email = Map.put(valid_params, :email, "nico@gmail.com      ")
      cs = Patient.changeset(%Patient{}, with_ws_email)
      assert cs.changes.email == "nico@gmail.com"
    end

    test "does not override given profile image", %{valid_params: valid_params} do
      with_ws_email = Map.put(valid_params, :profile_image_url, "some-url.com")
      cs = Patient.changeset(%Patient{}, with_ws_email)
      assert cs.changes.profile_image_url == "some-url.com"
    end
  end
end
