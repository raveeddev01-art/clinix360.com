defmodule Stitch.Repo.Migrations.CreateInvitationsModel do
  use Ecto.Migration

  def change do
    create table(:invitations) do
      add :user_id, references(:users, on_delete: :nothing), null: true
      add :team_id, references(:teams, on_delete: :nothing), null: true
      add :invite_token, :string
      add :accepted, :boolean, default: false

      timestamps()
    end
  end
end
