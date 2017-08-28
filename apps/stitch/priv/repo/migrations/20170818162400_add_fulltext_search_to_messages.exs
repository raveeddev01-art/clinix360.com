defmodule Stitch.Repo.Migrations.AddFulltextSearchToMessages do
  use Ecto.Migration

  def up do
    execute "CREATE extension if not exists pg_trgm;"
    execute "CREATE INDEX messages_text_content_trgm_index ON messages USING GIN (to_tsvector('english', text_content));"
  end

  def down do
    execute "DROP INDEX messages_text_content_trgm_index;"
  end
end
