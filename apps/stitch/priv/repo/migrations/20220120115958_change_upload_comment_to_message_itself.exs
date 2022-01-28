defmodule Stitch.Repo.Migrations.ChangeUploadCommentToMessageItself do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add(:parent_message_id, references(:messages, on_delete: :delete_all))
    end
  end
end
