defmodule Stitch.Web.Api.V1.TeamPatientView do
  alias Stitch.AWS.S3
  use Stitch.Web, :view

  def render("index.json", %{team_patients: team_patients}) do
    Enum.map(team_patients, &team_patient_json/1)
  end

  def render("show.json", %{team_patient: team_patient, patient: patient}) do
    team_patient_json(team_patient, patient)
  end

  def render("show.json", %{team_patient: team_patient}) do
    team_patient_json(team_patient, team_patient.patient)
  end

  def team_patient_json(team_patient, patient) do
    {:ok, avatar} = S3.presign(patient.profile_image_url)
    {:ok, avatar_thumb} = S3.presign(patient.profile_image_thumb_url)

    %{
      id: team_patient.id,
      active: team_patient.active,
      metadata: team_patient.metadata,
      mrn: team_patient.mrn,
      first_name: patient.first_name,
      last_name: patient.last_name,
      full_name: "#{patient.first_name} #{patient.last_name}",
      email: patient.email,
      phone: patient.phone_number,
      onboarded: patient.onboarded,
      avatar: avatar,
      avatar_thumb: avatar_thumb
    }
  end

  def team_patient_json(team_patient) do
    team_patient = Stitch.Repo.preload(team_patient, :patient)
    team_patient_json(team_patient, team_patient.patient)
  end
end
