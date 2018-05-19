defmodule Stitch.Repo.Migrations.AddHipaaEnabledToTeams do
  use Ecto.Migration

  def change do
    alter table(:teams) do
      add(:hipaa_enabled, :boolean, null: false, default: true)
    end
  end
end
