defmodule Stitch.Repo.Migrations.AddAnalyticsFielsToMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add(:client_device_type, :string, default: "unknown", null: false)
      add(:client_os, :string, default: "unknown", null: false)
      add(:client_name, :string, default: "unknown", null: false)
    end
  end
end
