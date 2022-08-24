defmodule Stitch.Repo.Migrations.AddStatusToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add(:status_text, :string, null: false, default: "")
      add(:status_emoji, :string, null: false, default: "")
      add(:status_time, :utc_datetime, null: true)
    end
  end
end
