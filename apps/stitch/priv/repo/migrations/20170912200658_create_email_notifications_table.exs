defmodule Stitch.Repo.Migrations.CreateEmailNotificationsTable do
  use Ecto.Migration

  def change do
    create table(:email_notifications) do
      add :message_id, references(:messages, on_delete: :delete_all)
      add :user_id, references(:users, on_delete: :delete_all)
      add :delivered, :boolean, default: false
      timestamps()
    end

    create index(:email_notifications, :user_id)
  end
end
