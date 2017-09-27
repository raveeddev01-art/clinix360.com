defmodule Stitch.Repo.Migrations.AddUnreadMessagesCountToGroupUsers do
  use Ecto.Migration

  def up do
    alter table(:group_users) do
      add :unread_messages_count, :integer, default: 0, null: false
      add :mentions_count, :integer, default: 0, null: false
      add :last_read_at, :utc_datetime, null: true
      remove :mentioning_message_ids
    end
  end

  def down do
    alter table(:group_users) do
      remove :unread_messages_count
      remove :mentions_count
      remove :last_read_at
      add :mentioning_message_ids, :map, default: "{}", null: false
    end
  end
end
