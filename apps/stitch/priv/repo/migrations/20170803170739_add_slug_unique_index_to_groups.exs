defmodule Stitch.Repo.Migrations.AddSlugUniqueIndexToGroups do
  use Ecto.Migration

  def change do
    create unique_index(:groups, [:slug, :team_id], name: :groups_slug_team_id_unique_index)
  end
end
