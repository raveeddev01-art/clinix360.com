defmodule Stitch.Repo.Migrations.CreateNewsTable do
  use Ecto.Migration

  def change do
    create table(:news) do
      add(:title, :text)
      add(:html_body, :text)
      add(:permalink, :text)
      timestamps()
    end

    create(unique_index(:news, :permalink, name: :news_permalink_unique_index))
  end
end
