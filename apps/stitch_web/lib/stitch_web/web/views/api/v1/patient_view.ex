defmodule Stitch.Web.Api.V1.TeamPatientView do
  use Stitch.Web, :view

  def render("index.json", %{team_patients: team_patients}) do
    Enum.map(team_patients, &team_patient_json/1)
  end

  def render("show.json", %{team_patient: team_patient}) do
    team_patient_json(team_patient)
  end

  def team_patient_json(team_patient) do
    %{
      id: team_patient.patient.id,
      first_name: team_patient.patient.first_name,
      last_name: team_patient.patient.last_name,
      full_name: "#{team_patient.patient.first_name} #{team_patient.patient.last_name}",
      email: team_patient.patient.email,
      phone: team_patient.patient.phone_number,
      onboarded: team_patient.patient.onboarded,
      active: team_patient.active,
      metadata: team_patient.metadata,
      avatar: team_patient.patient.profile_image_url,
      avatar_thumb: team_patient.patient.profile_image_thumb_url
    }
  end
end
