defmodule Stitch.Repo.Migrations.AddTeamFeaturesTable do
  use Ecto.Migration

  def change do
    create table(:team_features) do
      add(:team_id, references(:teams, on_delete: :delete_all))
      add(:name, :string)
      timestamps()
    end

    create(unique_index(:team_features, [:name, :team_id]))
  end
end
