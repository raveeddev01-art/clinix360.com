defmodule Repo.Migrations.AddVersions do
  use Ecto.Migration

  def change do
    create table(:versions) do
      add(:event, :string, null: false)
      add(:record_type, :string, null: false)
      add(:record_id, :integer)
      add(:record, :map, null: false)
      add(:originator_id, references(:users))
      add(:originator_type, :string)
      add(:meta, :map)

      add(:inserted_at, :utc_datetime, null: false)
    end

    create(index(:versions, [:originator_id]))
    create(index(:versions, [:record_id]))
  end
end
