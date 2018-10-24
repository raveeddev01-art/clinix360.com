defmodule Stitch.Files.PatientUpload do
  alias Stitch.{
    Files.EngageUpload,
    Files.PatientUpload,
    Repo,
    Patient
  }

  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{}

  schema "patient_uploads" do
    belongs_to(:engage_upload, EngageUpload)
    belongs_to(:patient, Patient)
    timestamps(updated_at: false)
  end

  def create(%Patient{} = patient, %EngageUpload{} = engage_upload) do
    %PatientUpload{patient_id: patient.id, engage_upload_id: engage_upload.id}
    |> new()
    |> Repo.insert()
  end

  def new(%PatientUpload{} = patient_upload \\ %PatientUpload{}) do
    patient_upload
    |> cast(%{}, [])
    |> unique_constraint(
      :engage_upload_id,
      name: :patient_uploads_patient_id_engage_upload_id_index,
      message: "The file is already shared with this patient"
    )
  end
end
