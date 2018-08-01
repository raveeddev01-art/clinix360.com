defmodule Stitch.Repo.Migrations.CreatePatientUploadsTable do
  use Ecto.Migration

  def change do
    create table(:patient_uploads) do
      add(:patient_id, references(:patients, on_delete: :delete_all))
      add(:engage_upload_id, references(:engage_uploads, on_delete: :delete_all))

      timestamps(updated_at: false)
    end

    create(unique_index(:patient_uploads, [:patient_id, :engage_upload_id]))
  end
end
