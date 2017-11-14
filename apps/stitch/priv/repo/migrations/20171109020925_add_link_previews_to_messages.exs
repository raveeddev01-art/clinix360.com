defmodule Stitch.Repo.Migrations.AddLinkPreviewsToMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add :has_links, :boolean, default: false, null: false
      add :link_previews_generated, :boolean, default: false, null: false
      add :link_previews, {:array, :map}, default: [], null: false
    end
  end
end
