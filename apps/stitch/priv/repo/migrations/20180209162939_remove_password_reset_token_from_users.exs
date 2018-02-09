defmodule Stitch.Repo.Migrations.RemovePasswordResetTokenFromUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      remove :password_reset_token
    end
  end
end
