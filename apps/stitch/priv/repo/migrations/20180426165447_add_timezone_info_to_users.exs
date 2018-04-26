defmodule Stitch.Repo.Migrations.AddTimezoneInfoToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :timezone, :map, default: "{}"
    end
  end
end
