defmodule Stitch.Repo.Migrations.AddTeamUsersTable do
  use Ecto.Migration

  def change do
    create table(:team_users) do
      add :role, :string
      add :user_id, references(:users, on_delete: :nothing), null: false
      add :team_id, references(:teams, on_delete: :nothing), null: false

      timestamps()
    end
    create index(:team_users, [:team_id])
    create index(:team_users, [:user_id])
  end
end
