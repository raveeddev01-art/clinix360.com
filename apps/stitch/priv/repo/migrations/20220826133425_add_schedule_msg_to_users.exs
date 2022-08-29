defmodule Stitch.Repo.Migrations.AddScheduleMsgToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add(:schedule_msg, :string, null: false, default: "")
      add(:schedule_time, :string, null: false, default: "")
    end
  end
end
