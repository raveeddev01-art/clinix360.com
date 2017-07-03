defmodule Stitch.Repo.Migrations.AddEmailConfirmedToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :email_confirmed, :boolean, default: false
    end
  end
end
