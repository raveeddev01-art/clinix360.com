defmodule Stitch.Repo.Migrations.DropIntegrationSettingsTable do
  use Ecto.Migration

  def change do
    drop(table("integration_configs"))
  end
end
