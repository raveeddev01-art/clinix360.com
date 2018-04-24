defmodule Stitch.Repo.Migrations.CreateAppsTable do
  use Ecto.Migration

  def change do
    create table(:apps) do
      add(:name, :string)
      add(:slug, :string)
      add(:description, :text)
      add(:icon_url, :string)
      timestamps()
    end

    create(unique_index(:apps, :name, name: :apps_name_unique_index))
    create(unique_index(:apps, :slug, name: :apps_slug_unique_index))
  end
end
