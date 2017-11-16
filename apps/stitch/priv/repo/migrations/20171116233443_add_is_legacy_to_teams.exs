defmodule Stitch.Repo.Migrations.AddIsLegacyToTeams do
  use Ecto.Migration

  def change do
    alter table(:teams) do
      add :is_legacy, :boolean, null: true, default: false
    end
  end
end
