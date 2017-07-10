defmodule Stitch.Repo.Migrations.AddTokenToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :token, :string
    end

    create unique_index(:users, [:token])
  end
end
