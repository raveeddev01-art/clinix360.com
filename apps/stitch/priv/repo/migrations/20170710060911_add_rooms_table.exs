defmodule Stitch.Repo.Migrations.AddRoomsTable do
  use Ecto.Migration

  def change do
    create table(:rooms) do
      add :name, :string
      add :team_id, references(:teams, on_delete: :nothing), null: true

      timestamps()
    end
  end
end
