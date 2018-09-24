defmodule Stitch.Repo.Migrations.CreateAnalyticsMessageCountTable do
  use Ecto.Migration

  def change do
    create table(:analytics_message_counts) do
      add(:count, :integer, null: false, default: 0)
      add(:date, :naive_datetime, null: false)
    end

    create(unique_index(:analytics_message_counts, [:date]))
  end
end
