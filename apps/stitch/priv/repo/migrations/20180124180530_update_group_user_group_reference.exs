defmodule Stitch.Repo.Migrations.UpdateGroupUserGroupReference do
  use Ecto.Migration

  def change do
    alter table(:group_users) do
      add :group_id, references(:groups, on_delete: :nothing)
    end
  end
end
