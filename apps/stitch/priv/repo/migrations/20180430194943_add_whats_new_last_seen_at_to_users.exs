defmodule Stitch.Repo.Migrations.AddWhatsNewLastSeenAtToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add(:whats_new_last_seen_at, :utc_datetime, null: true)
    end
  end
end
