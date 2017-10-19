defmodule Stitch.Repo.Migrations.AddIsHiddenToGroupUsers do
  use Ecto.Migration

  def change do
    alter table(:group_users) do
      add :is_hidden, :boolean, null: false, default: false
    end
  end
end
