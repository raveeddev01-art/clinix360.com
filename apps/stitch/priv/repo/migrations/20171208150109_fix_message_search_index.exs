defmodule Stitch.Repo.Migrations.FixMessageSearchIndex do
  use Ecto.Migration

  def up do
    execute "DROP INDEX messages_text_content_trgm_index;"
    execute "CREATE INDEX messages_text_content_trgm_index ON messages USING GIN (text_content gin_trgm_ops) WHERE type <> 'system'"
  end

  def down do
    execute "DROP INDEX messages_text_content_trgm_index;"
  end
end
