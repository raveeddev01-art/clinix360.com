defmodule Stitch.Repo.Migrations.DropDuplicateIndex do
  use Ecto.Migration

  def change do
    # Duplicate of :users_email_team_id_index
    drop unique_index(:users, [:email, :team_id], name: :users_unique_email_team_id_index)
  end
end
