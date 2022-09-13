defmodule Stitch.Repo.Migrations.AddStatusFieldsUser do
  use Ecto.Migration

  def change do
    alter table(:users) do
      remove(:status_text)
      remove(:status_emoji)
      remove(:status_time)
      add(:status_fields, :map, default: %{}, null: false)
    end
  end
end
