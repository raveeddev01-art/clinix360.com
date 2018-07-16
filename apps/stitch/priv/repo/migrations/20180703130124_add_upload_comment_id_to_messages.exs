defmodule Stitch.Repo.Migrations.AddUploadCommentIdToMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add(:upload_comment_id, references(:upload_comments, on_delete: :delete_all))
    end
  end
end
