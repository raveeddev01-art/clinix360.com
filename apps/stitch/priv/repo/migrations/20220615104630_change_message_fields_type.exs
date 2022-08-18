defmodule Stitch.Repo.Migrations.ChangeMessageFieldsType do
  use Ecto.Migration

  def change do
    execute("ALTER TABLE messages ALTER COLUMN fields TYPE JSONB[] USING ARRAY[fields]::jsonb[];")
  end
end
