defmodule Stitch.Repo.Migrations.AddFieldsToStatus do
  use Ecto.Migration

  def change do

    alter table(:status) do
    add :user_id, references(:users, on_delete: :delete_all),
          null: false
    timestamps()
    end
  end
end
