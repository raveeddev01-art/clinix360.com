defmodule Stitch.Repo.Migrations.CreateConversationProvidersTable do
  use Ecto.Migration

  def change do
    create table(:conversation_providers) do
      add(:conversation_id, references(:conversations, on_delete: :delete_all))
      add(:provider_id, references(:users, on_delete: :delete_all))

      add(:assigned, :boolean, default: false)
      add(:unread_messages_count, :integer, default: 0, null: false)
      add(:last_read_at, :utc_datetime, null: true)

      timestamps()
    end

    create(
      unique_index(
        :conversation_providers,
        [:conversation_id, :provider_id],
        name: :conversation_providers_conversation_id_provider_id_index
      )
    )
  end
end
