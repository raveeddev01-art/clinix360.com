defmodule Stitch.Repo.Migrations.AddNotificationPreferenceToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :notification_preference, :string, default: "everything", null: false
    end
  end
end
