defmodule Stitch.Repo.Migrations.AddTextContentToMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add :text_content_meta, {:array, :map}, default: []
    end
  end
end
