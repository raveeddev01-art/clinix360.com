defmodule Stitch.Repo.Migrations.AddIsDefaultToGroups do
  use Ecto.Migration

  def change do
    alter table(:groups) do
      add :is_default, :boolean, null: false, default: false
    end

    create unique_index(:groups, :team_id, where: "is_default = TRUE")
  end
end
