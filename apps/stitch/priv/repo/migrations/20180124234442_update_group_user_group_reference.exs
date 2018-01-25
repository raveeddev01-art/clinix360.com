defmodule Stitch.Repo.Migrations.UpdateGroupUserGroupReference do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE group_users DROP CONSTRAINT group_users_group_id_fkey"

    alter table(:group_users) do
      modify :group_id, references(:groups, on_delete: :delete_all)
    end
  end

  def down do
    execute "ALTER TABLE group_users DROP CONSTRAINT group_users_group_id_fkey"

    alter table(:group_users) do
      modify :group_id, references(:groups, on_delete: :nothing)
    end
  end
end
