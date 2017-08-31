defmodule Stitch.Repo.Migrations.AddNotificationPreferenceToGroupUsers do
  use Ecto.Migration

  def change do
    alter table(:group_users) do
      add :notification_preference, :string, default: "default", null: false
    end
  end
end
