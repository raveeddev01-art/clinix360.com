defmodule Stitch.Repo.Migrations.RemoveInviteTokenFromUsersTable do
  use Ecto.Migration

  def change do
    alter table(:users) do
      remove :invite_token
    end
  end
end
