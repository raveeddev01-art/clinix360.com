defmodule Stitch.Repo.Migrations.AddSlackImportIdToGroups do
  use Ecto.Migration

  def change do
    alter table(:groups) do
      add(:slack_import_id, :string, null: true)
    end
  end
end
