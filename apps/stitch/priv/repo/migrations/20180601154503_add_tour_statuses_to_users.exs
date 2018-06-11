defmodule Stitch.Repo.Migrations.AddTourStatusesToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      # Pending, Later, Skipped, Completed
      add(:connect_tour_status, :string, default: "Pending")
      add(:platform_tour_status, :string, default: "Pending")
    end
  end
end
