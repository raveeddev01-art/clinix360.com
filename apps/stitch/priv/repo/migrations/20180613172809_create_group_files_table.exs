defmodule Stitch.Repo.Migrations.CreateGroupUploadTable do
  use Ecto.Migration

  def change do
    create table(:group_uploads) do
      add(:group_id, references(:groups, on_delete: :delete_all))
      add(:upload_id, references(:uploads, on_delete: :delete_all))

      timestamps(updated_at: false)
    end

    create(unique_index(:group_uploads, [:group_id, :upload_id]))
  end
end
