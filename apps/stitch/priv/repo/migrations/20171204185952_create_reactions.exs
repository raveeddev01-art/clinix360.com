defmodule Stitch.Repo.Migrations.CreateReactions do
  use Ecto.Migration

  def change do
    create table(:reactions) do
      add :user_id, references(:users, on_delete: :delete_all)
      add :message_id, references(:messages, on_delete: :delete_all)
      add :emoji_name, :string
      timestamps(updated_at: false)
    end

    create unique_index(:reactions, [:emoji_name, :user_id, :message_id])
  end
end
