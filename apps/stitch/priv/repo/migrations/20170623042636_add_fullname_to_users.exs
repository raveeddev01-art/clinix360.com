defmodule Stitch.Repo.Migrations.AddFullnameToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :fullname, :string
    end
  end
end
