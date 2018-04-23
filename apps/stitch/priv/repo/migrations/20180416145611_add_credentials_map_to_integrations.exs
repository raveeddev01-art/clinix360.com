defmodule Stitch.Repo.Migrations.AddCredentialsMapToIntegrations do
  use Ecto.Migration

  def change do
    alter table("integrations") do
      add(:credentials, :map)
    end
  end
end
