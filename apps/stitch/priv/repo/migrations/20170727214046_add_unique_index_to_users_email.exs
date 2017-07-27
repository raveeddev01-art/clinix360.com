defmodule Stitch.Repo.Migrations.AddUniqueIndexToUsersEmail do
  use Ecto.Migration

  def change do
    drop index(:users, [:email])
    create unique_index(:users, [:email, :team_id], name: :users_unique_email_team_id_index)
  end
end
