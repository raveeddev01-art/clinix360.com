defmodule Stitch.Repo.Migrations.AddDisabledToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :disabled, :boolean, default: false
    end
  end
end
