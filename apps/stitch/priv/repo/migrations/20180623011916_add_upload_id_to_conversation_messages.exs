defmodule Stitch.Repo.Migrations.AddUploadIdToConversationMessages do
  use Ecto.Migration

  def change do
    alter table(:conversation_messages) do
      add(:upload_id, references(:uploads, on_delete: :delete_all))
    end
  end
end
