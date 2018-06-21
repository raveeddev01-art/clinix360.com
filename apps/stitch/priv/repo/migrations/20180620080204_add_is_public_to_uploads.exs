defmodule Stitch.Repo.Migrations.AddIsPublicToUploads do
  use Ecto.Migration

  def change do
    alter table(:uploads) do
      add(:public, :boolean, null: false, default: true)
    end
  end
end
