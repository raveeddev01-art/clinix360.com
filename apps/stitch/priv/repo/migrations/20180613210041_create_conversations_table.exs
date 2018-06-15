defmodule Stitch.Repo.Migrations.CreateConversationsTable do
  use Ecto.Migration

  def change do
    create table(:conversations) do
      add(:inbox_id, references(:inboxes, on_delete: :delete_all), null: false)

      add(:slug, :string)
      add(:open, :boolean, default: true)

      timestamps()
    end

    create(
      unique_index(
        :conversations,
        [:inbox_id, :slug],
        name: :conversations_inbox_id_slug_index
      )
    )
  end
end
