defmodule Stitch.Repo.Migrations.CreateIntegrationModels do
  use Ecto.Migration

  def change do
    # Create Integrations table, used to save integration per team.
    create table(:integrations) do
      add(:team_id, references(:teams, on_delete: :delete_all))
      add(:name, :string)
      add(:enabled, :boolean, default: false)
      add(:settings, :map)
      timestamps()
    end

    create(index(:integrations, [:team_id]))

    # Create Integration_Configs table, used to save N configurations
    # per team Integration.
    create table(:integration_configs) do
      # If someone deletes the integration, let's also remove all configs.
      add(:integration_id, references(:integrations, on_delete: :delete_all))

      # If someone deletes the group, let's also remove the integration config
      # setup for that group.
      add(:group_id, references(:groups, on_delete: :delete_all))

      # We don't know what kind of settings each integration will give us,
      # so we go with a generic jsonb map.
      add(:settings, :map)

      timestamps()
    end

    create(index(:integration_configs, [:integration_id, :group_id]))
  end
end
