defmodule Stitch.Repo.Migrations.ChangeUploadIdToEngageUploadId do
  use Ecto.Migration

  def up do
    alter table(:conversation_messages) do
      remove(:upload_id)
      add(:engage_upload_id, references(:engage_uploads, on_delete: :delete_all))
    end
  end

  def down do
    alter table(:conversation_messages) do
      remove(:engage_upload_id)
      add(:upload_id, references(:engage_uploads, on_delete: :delete_all))
    end
  end
end
