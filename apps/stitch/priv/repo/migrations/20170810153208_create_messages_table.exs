defmodule Stitch.Repo.Migrations.CreateMessagesTable do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :user_id, references(:users, on_delete: :nothing)
      add :group_id, references(:groups, on_delete: :nothing)
      add :deleted, :boolean, default: false
      add :text_content, :text
      add :fields, :map

      timestamps()
    end
  end
end
