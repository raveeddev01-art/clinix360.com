defmodule Stitch.Repo.Migrations.ChangeUploadCommentToMessageItself do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add(:messages_id, references(:messages, on_delete: :delete_all))
    end
  end
end
