defmodule Stitch.Repo.Migrations.AddAnalyticsFielsToMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add(:client_device, :string, default: "unknown", null: false)
      add(:client_os, :string, default: "unknown", null: false)
      add(:client_type, :string, default: "unknown", null: false)
      add(:client_is_mobile, :boolean)
    end
  end
end
