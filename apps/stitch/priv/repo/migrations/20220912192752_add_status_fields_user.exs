defmodule Stitch.Repo.Migrations.AddStatusFieldsUser do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add(:status_fields, :map, default: %{}, null: false)
    end
  end
end
