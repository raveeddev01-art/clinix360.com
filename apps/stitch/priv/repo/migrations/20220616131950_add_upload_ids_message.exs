defmodule Stitch.Repo.Migrations.AddUploadIdsMessage do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add(:upload_ids, {:array, :integer}, default: [], null: false)
    end
  end
end
