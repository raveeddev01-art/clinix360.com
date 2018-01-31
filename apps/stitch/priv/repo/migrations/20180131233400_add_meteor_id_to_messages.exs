defmodule Stitch.Repo.Migrations.AddMeteorIdToMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add :meteor_id, :string
    end
  end
end
