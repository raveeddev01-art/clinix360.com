defmodule Stitch.Repo.Migrations.UpdateLastReadAtFormat do
  use Ecto.Migration

  def up do
    alter table(:group_users) do
      modify :last_read_at, :naive_datetime, null: true
    end
  end

  def down do
    alter table(:group_users) do
      modify :last_read_at, :utc_datetime, null: true
    end
  end
end
