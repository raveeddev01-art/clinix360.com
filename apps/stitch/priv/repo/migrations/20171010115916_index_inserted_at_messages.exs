defmodule Stitch.Repo.Migrations.IndexInsertedAtMessages do
  use Ecto.Migration

  def up do
    create index(:messages, [:inserted_at, :group_id, :user_id])
  end

  def down do
    drop index(:messages, [:inserted_at, :group_id, :user_id])
  end
end
