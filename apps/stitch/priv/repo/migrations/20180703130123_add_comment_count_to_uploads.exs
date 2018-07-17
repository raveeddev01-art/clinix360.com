defmodule Stitch.Repo.Migrations.AddCommentCountToUploads do
  use Ecto.Migration

  def change do
    alter table(:uploads) do
      add(:comment_count, :integer, default: 0)
    end
  end
end
