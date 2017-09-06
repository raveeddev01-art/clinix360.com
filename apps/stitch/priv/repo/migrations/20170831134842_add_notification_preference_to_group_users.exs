defmodule Stitch.Repo.Migrations.AddNotificationPreferenceToGroupUsers do
  use Ecto.Migration

  def change do
    alter table(:group_users) do
      add :desktop_notification_preference, :string, default: "default", null: false
      add :mobile_notification_preference, :string, default: "default", null: false
    end
  end
end
