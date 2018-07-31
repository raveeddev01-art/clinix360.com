defmodule Stitch.Repo.Migrations.CreateCallsTable do
  use Ecto.Migration

  def change do
    create table(:calls) do
      add(:hash, :string)
      add(:session_id, :string)
      add(:caller_id, references(:users))
      add(:started_at, :bigint, null: true)
      add(:ended_at, :bigint, null: true)
      add(:attendees, {:array, :integer}, null: false, default: [])
      add(:active_now, {:array, :integer}, null: false, default: [])
      add(:status, :string)

      timestamps()
    end

    create(index(:calls, [:hash]))
    create(index(:calls, [:session_id]))
  end
end
