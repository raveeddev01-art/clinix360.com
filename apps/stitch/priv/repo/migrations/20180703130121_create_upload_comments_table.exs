defmodule Stitch.Repo.Migrations.CreateUploadCommentsTable do
  use Ecto.Migration

  def change do
    create table(:upload_comments) do
      add(:upload_id, references(:uploads, on_delete: :delete_all))
      add(:user_id, references(:users, on_delete: :delete_all))
      add(:text_content, :text, null: false)
      add(:fields, :map, null: false)
      timestamps()
    end
  end
end
