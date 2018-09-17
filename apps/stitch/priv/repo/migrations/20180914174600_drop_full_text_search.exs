defmodule Stitch.Repo.Migrations.DropFullTextSearch do
  use Ecto.Migration

  def up do
    execute("DROP INDEX messages_text_content_trgm_index;")
  end

  def down do
  end
end
