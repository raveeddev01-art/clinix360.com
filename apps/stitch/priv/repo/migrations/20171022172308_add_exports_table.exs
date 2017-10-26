defmodule Stitch.Repo.Migrations.AddExportsTable do
  use Ecto.Migration

  def change do
    create table(:exports) do
      add :status, :string
      add :zip_url, :string
      add :team_id, references(:teams, on_delete: :delete_all)
      timestamps()
    end

    create index(:exports, :team_id)
  end
end
