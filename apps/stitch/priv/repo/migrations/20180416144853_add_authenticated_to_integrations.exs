defmodule Stitch.Repo.Migrations.AddAuthenticatedToIntegrations do
  use Ecto.Migration

  def change do
    alter table("integrations") do
      add(:authenticated, :boolean, default: false)
    end
  end
end
