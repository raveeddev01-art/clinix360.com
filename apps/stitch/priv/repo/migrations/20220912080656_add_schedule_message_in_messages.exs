defmodule Stitch.Repo.Migrations.AddScheduleMessageInMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add(:scheduled_at, :naive_datetime, default: nil, null: true)
    end
  end
end
