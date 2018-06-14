defmodule Stitch.Repo.Migrations.AddUploadIdToMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add(:upload_id, references(:uploads, on_delete: :delete_all))
    end
  end
end
