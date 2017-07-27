defmodule Stitch.Repo.Migrations.AddUsersUsernameTeamIdIndex do
  use Ecto.Migration

  def change do
    create unique_index(:users, [:username, :team_id], name: :users_username_team_id_index)
  end
end
