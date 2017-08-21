defmodule Stitch.Repo.Migrations.CreateMessageRecipients do
  use Ecto.Migration

  def change do
    create table(:message_recipients) do
      add :group_user_id, references(:group_users, on_delete: :delete_all), null: false
      add :message_id, references(:messages, on_delete: :delete_all), null: false

      add :read_at, :utc_datetime
    end

    create unique_index(:message_recipients, [:group_user_id, :message_id])
  end
end
