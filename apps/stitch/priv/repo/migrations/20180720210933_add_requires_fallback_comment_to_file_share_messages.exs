defmodule Stitch.Repo.Migrations.AddRequiresFallbackCommentToFileShareMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add(:requires_fallback_comment, :boolean, null: false, default: true)
    end
  end
end
