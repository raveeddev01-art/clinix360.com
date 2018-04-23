defmodule Stitch.Repo.Migrations.AddAppIdGroupIdToIntegrations do
  use Ecto.Migration

  def change do
    alter table(:integrations) do
      add(:app_id, references(:apps, on_delete: :nothing))
      add(:group_id, references(:groups, on_delete: :nothing))
    end
  end
end
