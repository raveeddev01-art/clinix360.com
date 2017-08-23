defmodule Stitch.Repo.Migrations.AddEditedAtToMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add :edited_at, :utc_datetime, null: true
    end
  end
end
