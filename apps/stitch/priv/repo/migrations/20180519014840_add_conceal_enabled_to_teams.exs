defmodule Stitch.Repo.Migrations.AddConcealEnabledToTeams do
  use Ecto.Migration

  def change do
    alter table(:teams) do
      add(:conceal_enabled, :boolean, null: false, default: true)
    end
  end
end
