defmodule Stitch.Repo.Migrations.RemoveGroupNotificationPreference do
  use Ecto.Migration

  def change do
    drop table(:group_notification_preferences)
  end
end
