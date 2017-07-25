defmodule Stitch.Repo.Migrations.AddSlugToRooms do
  use Ecto.Migration

  def change do
    alter table(:rooms) do
      add :slug, :string
    end

    create unique_index(:rooms, [:name, :team_id], name: :rooms_name_team_id_index)
  end
end
