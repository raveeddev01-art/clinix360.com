defmodule Stitch.Repo.Migrations.DropNameFromIntegrations do
  use Ecto.Migration

  def change do
    alter table(:integrations) do
      remove :name
    end
  end
end
