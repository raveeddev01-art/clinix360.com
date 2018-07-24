defmodule Stitch.Repo.Migrations.UpdateIntegrationsGroupIdReference do
  use Ecto.Migration

  def up do
    drop(constraint(:integrations, "integrations_group_id_fkey"))

    alter table(:integrations) do
      modify(:group_id, references(:groups, on_delete: :delete_all))
    end
  end

  def down do
    drop(constraint(:integrations, "integrations_group_id_fkey"))

    alter table(:integrations) do
      modify(:group_id, references(:groups, on_delete: :nothing))
    end
  end
end
