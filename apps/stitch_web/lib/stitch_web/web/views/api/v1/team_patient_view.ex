defmodule Stitch.Web.Api.V1.TeamPatientView do
  use Stitch.Web, :view

  def render("index.json", %{team_patients: team_patients}) do
    Enum.map(team_patients, &team_patient_json/1)
  end

  def render("show.json", %{team_patient: team_patient}) do
    team_patient_json(team_patient)
  end

  def team_patient_json(%Stitch.TeamPatient{patient: patient} = team_patient) do
    %{
      id: team_patient.id,
      active: team_patient.active,
      metadata: team_patient.metadata,
      patient_id: patient.id,
      first_name: patient.first_name,
      last_name: patient.last_name,
      full_name: "#{patient.first_name} #{patient.last_name}",
      email: patient.email,
      phone: patient.phone_number,
      onboarded: patient.onboarded,
      avatar: patient.profile_image_url,
      avatar_thumb: patient.profile_image_thumb_url
    }
  end
end
