defmodule Stitch.Repo.Migrations.CreateConversationProvidersTable do
  use Ecto.Migration

  def change do
    create table(:conversation_providers) do
      add(:conversation_id, references(:conversations, on_delete: :delete_all))
      add(:provider_id, references(:users, on_delete: :delete_all))

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
