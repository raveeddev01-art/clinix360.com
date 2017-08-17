defmodule Stitch.Repo.Migrations.AddIsPinnedAndPinnedByIdToMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add :pinned, :boolean, default: false, null: false
      add :pinned_by_id, references(:users, on_delete: :nothing)
      add :pinned_at, :utc_datetime, null: true
    end
  end
end

