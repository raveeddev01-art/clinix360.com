defmodule Repo.Migrations.AddVersions do
  use Ecto.Migration

  def change do
    create table(:versions) do
      add(:action, :string, null: false)
      add(:record_type, :string, null: false)
      add(:record_id, :integer, null: false)
      add(:record, :map, null: false)
      add(:committed_by_id, references(:users))
      add(:source, :string, null: true)
      add(:meta, :map, null: true)

      timestamps(updated_at: false)
    end

    create(index(:versions, [:committed_by_id]))
    create(index(:versions, [:record_id]))
  end
end
