defmodule Stitch.Repo.Migrations.UpdateMessagesGroupReference do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE messages DROP CONSTRAINT messages_group_id_fkey"

    alter table(:messages) do
      modify :group_id, references(:groups, on_delete: :delete_all)
    end
  end

  def down do
    execute "ALTER TABLE messages DROP CONSTRAINT messages_group_id_fkey"

    alter table(:messages) do
      modify :group_id, references(:groups, on_delete: :nothing)
    end
  end
end
