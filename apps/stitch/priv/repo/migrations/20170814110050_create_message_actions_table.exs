defmodule Stitch.Repo.Migrations.CreateMessageActionsTable do
  use Ecto.Migration

  def change do
    create table(:message_actions) do
      add :user_id, references(:users, on_delete: :nothing)
      add :message_id, references(:messages, on_delete: :delete_all)
      add :category, :string, null: false

      timestamps()
    end

    create unique_index(:message_actions, [:user_id, :message_id, :category])
    create index(:message_actions, :message_id)
  end
end
