defmodule Stitch.Web.Api.V1.TeamPatientView do
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
    # TODO: using the thumb twice to get around needless
    # S3 pre-signing. Use the non-thumb once you allow for
    # CDN'ed main avatars

    %{
      id: team_patient.id,
      active: team_patient.active,
      inserted_at: team_patient.inserted_at,
      metadata: team_patient.metadata,
      mrn: team_patient.mrn,
      first_name: patient.first_name,
      last_name: patient.last_name,
      full_name: "#{patient.first_name} #{patient.last_name}",
      email: patient.email,
      phone: patient.phone_number,
      onboarded: patient.onboarded,
      avatar: patient.profile_image_thumb_url,
      avatar_thumb: patient.profile_image_thumb_url
    }
  end

  def team_patient_json(nil), do: nil

  def team_patient_json(team_patient) do
    team_patient = Stitch.Repo.preload(team_patient, :patient)
    team_patient_json(team_patient, team_patient.patient)
  end
end
