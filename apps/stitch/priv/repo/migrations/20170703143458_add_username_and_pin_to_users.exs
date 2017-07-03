defmodule Stitch.Repo.Migrations.AddUsernameAndPinToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :username, :string
      add :pin, :string
    end
  end
end
