defmodule Stitch.Repo.Migrations.CreateInboxProvidersTable do
  use Ecto.Migration

  def change do
    create table(:inbox_providers) do
      add(:inbox_id, references(:inboxes, on_delete: :delete_all))
      add(:provider_id, references(:users, on_delete: :delete_all))

      timestamps()
    end

    create(
      unique_index(
        :inbox_providers,
        [:inbox_id, :provider_id],
        name: :inbox_providers_inbox_id_provider_id_index
      )
    )
  end
end
