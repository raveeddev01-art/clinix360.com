defmodule Stitch.Repo.Migrations.CreateGroupsTable do
  use Ecto.Migration

  def change do
    create table(:groups) do
      add :team_id, references(:teams, on_delete: :nothing), null: true
      add :name, :string
      add :slug, :string
      add :description, :string
      add :public, :boolean, default: true

      timestamps()
    end
  end
end
