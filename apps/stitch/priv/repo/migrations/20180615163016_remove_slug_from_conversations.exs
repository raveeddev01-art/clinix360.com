defmodule Stitch.Repo.Migrations.RemoveSlugFromConversations do
  use Ecto.Migration

  def change do
    drop(
      unique_index(:conversations, [:inbox_id, :slug], name: :conversations_inbox_id_slug_index)
    )

    alter table(:conversations) do
      remove(:slug)
    end
  end
end
