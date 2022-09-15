defmodule Stitch.Repo.Migrations.AddClearAfterStatus do
  use Ecto.Migration

  def change do
    alter table(:user_status) do
      add(:clear_after, :integer, default: 0, null: false)
    end
  end
end
