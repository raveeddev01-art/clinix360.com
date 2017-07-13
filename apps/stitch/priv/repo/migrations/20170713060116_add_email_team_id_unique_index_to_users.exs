defmodule Stitch.Repo.Migrations.AddEmailTeamIdUniqueIndexToUsers do
  use Ecto.Migration

  def change do
    create unique_index(:users, [:email, :team_id], name: :users_email_team_id_index)
  end
end
