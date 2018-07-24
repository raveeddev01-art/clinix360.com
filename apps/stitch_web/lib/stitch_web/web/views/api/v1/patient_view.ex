defmodule Stitch.Web.Api.V1.PatientView do
  use Stitch.Web, :view

  def render("index.json", %{patients: patients}) do
    Enum.map(patients, &patient_json/1)
  end

  def render("show.json", %{patient: patient}) do
    patient_json(patient)
  end

  def render("login.json", %{patient: patient, redirect_url: redirect_url}) do
    patient = Stitch.Repo.preload(patient, :team)

    %{
      patient: patient_json(patient),
      redirect_url: redirect_url,
      token: patient.token,
      team: %{
        id: patient.team.id,
        name: patient.team.name,
        slug: patient.team.slug
      }
    }
  end

  def patient_json(nil), do: nil

  def patient_json(patient) when not is_nil(patient) do
    # TODO: using the thumb twice to get around needless
    # S3 pre-signing. Use the non-thumb once you allow for
    # CDN'ed main avatars

    %{
      id: patient.id,
      avatar_thumb: patient.profile_image_thumb_url,
      avatar: patient.profile_image_thumb_url,
      disabled: patient.disabled,
      email: patient.email,
      first_name: patient.first_name,
      full_name: "#{patient.first_name} #{patient.last_name}",
      inserted_at: patient.inserted_at,
      updated_at: patient.updated_at,
      last_name: patient.last_name,
      mrn: patient.mrn,
      onboarded: patient.onboarded,
      phone: patient.phone_number,
      team_id: patient.team_id
    }
  end
end
