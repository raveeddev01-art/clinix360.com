defmodule Stitch.Repo.Migrations.AddUniqueIndexToUserEmail do
  use Ecto.Migration

  def change do
    create index(:users, [:email])
  end
end
