defmodule Stitch.Repo.Migrations.AddUnreadMessagesCountToGroupUsers do
  use Ecto.Migration

  def change do
    alter table(:group_users) do
      add :unread_messages_count, :integer, default: 0, null: false
      add :mentions_count, :integer, default: 0, null: false
      add :last_read_at, :utc_datetime, null: true
    end
  end
end
