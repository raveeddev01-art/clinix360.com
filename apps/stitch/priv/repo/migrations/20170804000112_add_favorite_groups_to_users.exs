defmodule Stitch.Repo.Migrations.AddFavoriteGroupsToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :favorite_groups, {:array, :integer}
    end
  end
end
