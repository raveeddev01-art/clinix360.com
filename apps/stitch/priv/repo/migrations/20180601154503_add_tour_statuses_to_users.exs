defmodule Stitch.Repo.Migrations.AddTourStatusesToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      # pending, later, skipped, completed
      add(:connect_tour_status, :string, default: "pending")
      add(:platform_tour_status, :string, default: "pending")
    end
  end
end
