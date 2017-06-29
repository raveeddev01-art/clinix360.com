defmodule Stitch.Repo.Migrations.AddTeamsTable do
  use Ecto.Migration

  def change do
    create table(:teams) do
      add :name, :string
      add :slug, :string

      timestamps()
    end
  end
end