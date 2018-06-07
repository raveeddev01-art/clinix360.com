defmodule Stitch.Web.Api.V1.PatientView do
  use Stitch.Web, :view

  def render("index.json", %{patients: patients}) do
    Enum.map(patients, &patient_json/1)
  end

  def render("show.json", %{patient: patient}) do
    patient_json(patient)
  end

  def patient_json(patient) do
    %{
      id: patient.id,
      first_name: patient.first_name,
      last_name: patient.last_name,
      full_name: "#{patient.first_name} #{patient.last_name}",
      email: patient.email,
      phone: patient.phone_number,
      onboarded: patient.onboarded,
      # team_patient.active
      active: false,
      # team_patient.metadata
      metadata: %{},
      avatar: patient.profile_image_url,
      avatar_thumb: patient.profile_image_thumb_url
    }
  end
end
