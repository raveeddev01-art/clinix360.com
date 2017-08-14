defmodule Stitch.Repo.Migrations.CreateGroupNotificationPreferencesTable do
  use Ecto.Migration

  def change do
    create table(:group_notification_preferences) do
      add :user_id, references(:users, on_delete: :nothing)
      add :group_id, references(:groups, on_delete: :nothing)
      add :setting, :text, default: "mentions"

      timestamps()
    end
  end
end
