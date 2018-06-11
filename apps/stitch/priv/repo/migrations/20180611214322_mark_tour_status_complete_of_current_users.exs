defmodule Stitch.Repo.Migrations.MarkTourStatusCompleteOfCurrentUsers do
  use Ecto.Migration

  def up do
    execute(
      "UPDATE users SET connect_tour_status = 'completed', platform_tour_status = 'completed'"
    )
  end

  def down do
    nil
  end
end
