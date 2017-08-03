defmodule Stitch.Repo.Migrations.CreateUserGroupsTable do
  use Ecto.Migration

  def change do
    create table(:group_users) do
      add :group_id, references(:groups, on_delete: :nothing)
      add :user_id, references(:users, on_delete: :nothing)

      timestamps()
    end

    create unique_index(:group_users, [:user_id, :group_id], name: :group_users_group_user_id_unique_index)
  end
end
