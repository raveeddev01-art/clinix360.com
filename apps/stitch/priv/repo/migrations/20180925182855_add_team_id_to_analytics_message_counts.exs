defmodule Stitch.Repo.Migrations.AddTeamIdToAnalyticsMessageCounts do
  use Ecto.Migration

  def up do
    alter table(:analytics_message_counts) do
      add(:team_id, :integer, null: true)
    end

    flush()

    drop(unique_index(:analytics_message_counts, [:date]))

    flush()

    create(unique_index(:analytics_message_counts, [:date, :team_id]))
  end

  def down do
  end
end
