defmodule Stitch.Repo.Migrations.RemoveRooms do
  use Ecto.Migration

  def change do
    drop table(:rooms)
  end
end
